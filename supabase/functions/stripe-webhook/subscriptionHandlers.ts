
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.9.0";
import { logStep } from "./utils.ts";

// Handle successful subscription
export async function handleSuccessfulSubscription(
  supabaseClient: any,
  userId: string,
  session: any
) {
  // Get customer ID from session
  const customerId = session.customer;
  
  try {
    // Get user by ID
    const { data: userData, error: userError } = await supabaseClient.auth
      .admin
      .getUserById(userId);
    
    if (userError) {
      logStep("Error fetching user data", { error: userError.message, userId });
      throw userError;
    }
    
    // Get or create subscriber record
    let email = userData.user?.email;
    if (!email) {
      logStep("Email not found in user data, fetching from Stripe", { userId });
      // Fallback to fetching from Stripe
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
        apiVersion: "2022-11-15",
      });
      const customer = await stripe.customers.retrieve(customerId);
      email = typeof customer !== 'string' && 'email' in customer ? customer.email : null;
      logStep("Retrieved email from Stripe", { email });
    }
    
    if (!email) {
      logStep("Could not determine user email", { userId, customerId });
      throw new Error("Could not determine user email");
    }
    
    // Check if a subscription already exists for this user
    const { data: existingSubscriber } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", userId)
      .single();
      
    logStep("Checking for existing subscriber", { 
      exists: !!existingSubscriber, 
      email, 
      userId 
    });
    
    // Upsert subscriber data
    const { data: updatedData, error: upsertError } = await supabaseClient
      .from("subscribers")
      .upsert({
        user_id: userId,
        email: email,
        stripe_customer_id: customerId,
        subscribed: true,
        // Default to "Premium" until we get more details in subscription.updated event
        subscription_tier: "Premium",
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
    
    if (upsertError) {
      logStep("Error upserting subscriber", { error: upsertError.message });
      throw upsertError;
    }
    
    logStep("Successfully upserted subscriber", { userId, email });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling successful subscription", { error: errorMessage });
    throw error;
  }
}

// Handle subscription updates
export async function handleSubscriptionUpdate(supabaseClient: any, subscription: any) {
  const customerId = subscription.customer;
  const status = subscription.status;
  const isActive = status === "active" || status === "trialing";
  const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
  
  try {
    logStep("Handling subscription update", { 
      customerId, 
      status, 
      isActive, 
      subscriptionEnd: subscriptionEndDate 
    });
    
    // Get the price ID to determine subscription tier
    const priceId = subscription.items.data[0].price.id;
    
    // Get the subscription tier from price ID
    const { data: planData, error: planError } = await supabaseClient
      .from("subscription_plans")
      .select("name")
      .eq("stripe_price_id", priceId)
      .single();
    
    if (planError) {
      logStep("Error getting plan data", { error: planError.message, priceId });
      // Continue with default tier if we can't find the plan
    }
    
    // Find subscriber by Stripe customer ID
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("subscribers")
      .select("user_id")
      .eq("stripe_customer_id", customerId);
    
    if (subscribersError) {
      logStep("Error finding subscribers", { error: subscribersError.message });
      throw subscribersError;
    }
    
    if (!subscribers || subscribers.length === 0) {
      logStep("No subscriber found for customer", { customerId });
      return;
    }
    
    logStep("Found subscribers for customer", { 
      count: subscribers.length, 
      subscribers: subscribers.map(s => s.user_id) 
    });
    
    // Update subscriber record
    for (const subscriber of subscribers) {
      const { error: updateError } = await supabaseClient
        .from("subscribers")
        .update({
          subscribed: isActive,
          subscription_tier: planData?.name || "Premium", // Fallback to Premium
          subscription_end: subscriptionEndDate,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", subscriber.user_id);
      
      if (updateError) {
        logStep("Error updating subscriber", { 
          error: updateError.message, 
          userId: subscriber.user_id 
        });
      } else {
        logStep("Successfully updated subscriber", { 
          userId: subscriber.user_id, 
          tier: planData?.name || "Premium" 
        });
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling subscription update", { error: errorMessage });
    throw error;
  }
}

// Handle subscription cancellation
export async function handleSubscriptionCancellation(supabaseClient: any, subscription: any) {
  const customerId = subscription.customer;
  
  try {
    logStep("Handling subscription cancellation", { customerId });
    
    // Find subscribers with this customer ID
    const { data: subscribers, error: findError } = await supabaseClient
      .from("subscribers")
      .select("user_id")
      .eq("stripe_customer_id", customerId);
    
    if (findError) {
      logStep("Error finding subscribers to cancel", { error: findError.message });
      throw findError;
    }
    
    if (!subscribers || subscribers.length === 0) {
      logStep("No subscribers found for cancellation", { customerId });
      return;
    }
    
    // Update all subscribers for this customer
    for (const subscriber of subscribers) {
      const { error: updateError } = await supabaseClient
        .from("subscribers")
        .update({
          subscribed: false,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", subscriber.user_id);
      
      if (updateError) {
        logStep("Error cancelling subscription", { 
          error: updateError.message, 
          userId: subscriber.user_id 
        });
      } else {
        logStep("Successfully cancelled subscription", { userId: subscriber.user_id });
      }
    }
      
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error handling subscription cancellation", { error: errorMessage });
    throw error;
  }
}
