
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.9.0";

// CORS headers for API response
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook function started");
    
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      logStep("No stripe signature found", { status: 400 });
      return new Response(JSON.stringify({ error: "No stripe signature found" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      logStep("STRIPE_SECRET_KEY is not set", { status: 500 });
      return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY is not set" }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2022-11-15",
    });
    
    // Parse the event without verification first
    let event;
    
    try {
      event = JSON.parse(body);
      logStep("Event parsed successfully", { type: event.type });
    } catch (err) {
      logStep("Event parsing failed", { error: err.message, status: 400 });
      return new Response(JSON.stringify({ error: "Event parsing failed" }), { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Initialize Supabase client for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      logStep("Supabase environment variables not set", { status: 500 });
      return new Response(JSON.stringify({ error: "Supabase environment variables not set" }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    
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
          logStep("Processed checkout.session.completed event", { userId });
        }
        break;
        
      case "customer.subscription.updated":
        // Handle subscription updates
        const subscription = event.data.object;
        await handleSubscriptionUpdate(supabaseClient, subscription);
        logStep("Processed customer.subscription.updated event", { subId: subscription.id });
        break;
        
      case "customer.subscription.deleted":
        // Handle subscription cancellation
        const cancelledSubscription = event.data.object;
        await handleSubscriptionCancellation(supabaseClient, cancelledSubscription);
        logStep("Processed customer.subscription.deleted event", { subId: cancelledSubscription.id });
        break;
        
      default:
        logStep("Unhandled event type", { type: event.type });
        // Still return 200 for unhandled events to avoid Stripe retrying
    }
    
    // Return a 200 success response to confirm receipt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { message: errorMessage });
    
    // Still return 200 to avoid Stripe continuing to retry
    return new Response(JSON.stringify({ received: true, error: errorMessage }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
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
