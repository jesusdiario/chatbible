
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.9.0";

// This function handles webhook events from Stripe
serve(async (req) => {
  try {
    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2022-11-15",
    });

    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      return new Response("No stripe signature found", { status: 400 });
    }
    
    // Use the raw body text for signature verification
    const body = await req.text();
    
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event;
    
    // Verify the webhook signature
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.error(`Webhook signature verification failed:`, err);
        return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
      }
    } else {
      // If webhook secret isn't set, parse the body manually
      event = JSON.parse(body);
    }
    
    // Initialize Supabase client for updating records
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    console.log(`Processing webhook event: ${event.type}`);
    
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        // Handle checkout completion
        const session = event.data.object;
        
        // Find the related customer
        if (session.customer && session.client_reference_id) {
          const userId = session.client_reference_id;
          
          // Update subscriptions table
          await handleSuccessfulSubscription(supabaseClient, userId, session);
        }
        break;
        
      case "customer.subscription.updated":
        // Handle subscription updates
        const subscription = event.data.object;
        await handleSubscriptionUpdate(supabaseClient, subscription);
        break;
        
      case "customer.subscription.deleted":
        // Handle subscription cancellation
        const cancelledSubscription = event.data.object;
        await handleSubscriptionCancellation(supabaseClient, cancelledSubscription);
        break;
        
      // Add more event handlers as needed
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

// Handle successful subscription
async function handleSuccessfulSubscription(
  supabaseClient,
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
    
    if (userError) throw userError;
    
    // Get or create subscriber record
    let email = userData.user?.email;
    if (!email) {
      // Fallback to fetching from Stripe
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
        apiVersion: "2022-11-15",
      });
      const customer = await stripe.customers.retrieve(customerId);
      email = typeof customer !== 'string' && 'email' in customer ? customer.email : null;
    }
    
    if (!email) {
      throw new Error("Could not determine user email");
    }
    
    // Upsert subscriber data
    await supabaseClient.from("subscribers").upsert({
      user_id: userId,
      email: email,
      stripe_customer_id: customerId,
      subscribed: true,
      // We'll get more details in subscription.updated event
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    
  } catch (error) {
    console.error("Error handling successful subscription:", error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdate(supabaseClient, subscription: any) {
  const customerId = subscription.customer;
  const status = subscription.status;
  const isActive = status === "active" || status === "trialing";
  const subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
  
  try {
    // Get the price ID to determine subscription tier
    const priceId = subscription.items.data[0].price.id;
    
    // Get the subscription tier from price ID
    const { data: planData, error: planError } = await supabaseClient
      .from("subscription_plans")
      .select("name")
      .eq("stripe_price_id", priceId)
      .single();
    
    if (planError) {
      console.error("Error getting plan data:", planError);
      return;
    }
    
    // Find subscriber by Stripe customer ID
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("subscribers")
      .select("user_id")
      .eq("stripe_customer_id", customerId);
    
    if (subscribersError || !subscribers || subscribers.length === 0) {
      console.error("No subscriber found for customer:", customerId);
      return;
    }
    
    // Update subscriber record
    await supabaseClient
      .from("subscribers")
      .update({
        subscribed: isActive,
        subscription_tier: planData?.name || "Gratuito",
        subscription_end: subscriptionEndDate,
        updated_at: new Date().toISOString()
      })
      .eq("stripe_customer_id", customerId);
    
  } catch (error) {
    console.error("Error handling subscription update:", error);
    throw error;
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancellation(supabaseClient, subscription: any) {
  const customerId = subscription.customer;
  
  try {
    // Update subscriber record
    await supabaseClient
      .from("subscribers")
      .update({
        subscribed: false,
        updated_at: new Date().toISOString()
      })
      .eq("stripe_customer_id", customerId);
      
  } catch (error) {
    console.error("Error handling subscription cancellation:", error);
    throw error;
  }
}
