import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.9.0";
import { logStep } from "./utils.ts";

// Handle successful subscription
export async function handleSuccessfulSubscription(
  supabaseClient: any,
  session: any
) {
  // Get customer ID from session
  const customerId = session.customer;
  const metadata = session.metadata || {};
  
  try {
    const email = metadata.email;
    
    if (!email) {
      logStep("No email found in session metadata", { sessionId: session.id });
      throw new Error("No email found in session metadata");
    }

    logStep("Processing checkout session", { email, customerId });
    
    // Check if we need to create a new user account
    if (metadata.create_account === 'true' && metadata.password) {
      logStep("Creating new user account", { email });
      
      // Create user in Supabase
      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email: email,
        password: metadata.password,
        email_confirm: true,
        user_metadata: {
          full_name: metadata.name || email.split('@')[0]
        }
      });
      
      if (authError) {
        logStep("Error creating user account", { error: authError.message });
        throw authError;
      }
      
      const userId = authData.user.id;
      logStep("User account created successfully", { userId });
      
      // Create subscriber record
      const { error: subscriberError } = await supabaseClient
        .from("subscribers")
        .insert({
          user_id: userId,
          email: email,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_tier: "Premium", // Default tier
          updated_at: new Date().toISOString()
        });
      
      if (subscriberError) {
        logStep("Error creating subscriber record", { error: subscriberError.message });
        throw subscriberError;
      }
      
      logStep("Subscriber record created successfully", { userId });
    } else {
      // For existing users, update their subscription status
      logStep("Updating subscription for existing user", { email });
      
      // Get user by email
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserByEmail(email);
      
      if (userError) {
        logStep("Error fetching user data", { error: userError.message });
        throw userError;
      }
      
      if (!userData.user) {
        logStep("No user found with email", { email });
        throw new Error("No user found with email: " + email);
      }
      
      const userId = userData.user.id;
      
      // Upsert subscriber data
      const { error: upsertError } = await supabaseClient
        .from("subscribers")
        .upsert({
          user_id: userId,
          email: email,
          stripe_customer_id: customerId,
          subscribed: true,
          subscription_tier: "Premium", // Default tier until we get more details
          updated_at: new Date().toISOString()
        });
      
      if (upsertError) {
        logStep("Error upserting subscriber", { error: upsertError.message });
        throw upsertError;
      }
      
      logStep("Successfully updated subscriber", { userId, email });
    }
    
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
      .select("user_id, email")
      .eq("stripe_customer_id", customerId);
    
    if (subscribersError) {
      logStep("Error finding subscribers", { error: subscribersError.message });
      throw subscribersError;
    }
    
    if (!subscribers || subscribers.length === 0) {
      logStep("No subscriber found for customer, trying to find by customer email", { customerId });
      
      // Try to get customer email from Stripe
      try {
        const stripe = Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
        const customer = await stripe.customers.retrieve(customerId);
        
        if (customer && !customer.deleted && customer.email) {
          // Try to find user by email
          const { data: userData } = await supabaseClient.auth.admin.listUsers();
          const matchingUser = userData.users.find(u => u.email === customer.email);
          
          if (matchingUser) {
            logStep("Found user by email from Stripe", { email: customer.email });
            
            // Create subscriber record
            await supabaseClient.from("subscribers").insert({
              user_id: matchingUser.id,
              email: customer.email,
              stripe_customer_id: customerId,
              subscribed: isActive,
              subscription_tier: planData?.name || "Premium",
              subscription_end: subscriptionEndDate,
              updated_at: new Date().toISOString()
            });
            
            logStep("Created new subscriber record from Stripe customer data", { userId: matchingUser.id });
            return;
          }
        }
      } catch (stripeError) {
        logStep("Error retrieving customer from Stripe", { error: String(stripeError) });
      }
      
      logStep("No subscriber or matching user found for customer", { customerId });
      return;
    }
    
    logStep("Found subscribers for customer", { 
      count: subscribers.length, 
      subscribers: subscribers.map(s => ({ userId: s.user_id, email: s.email }))
    });
    
    // Update subscriber records
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
