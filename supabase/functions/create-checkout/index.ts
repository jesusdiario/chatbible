
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { priceId, successUrl, cancelUrl } = await req.json();
    logStep("Request received", { priceId, successUrl, cancelUrl });

    // Get STRIPE_SECRET_KEY from environment variable
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16'
    });

    // Get authenticated user from request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.split(' ')[1];
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !userData.user) {
      throw new Error('Authentication error: ' + (authError?.message || 'User not found'));
    }

    logStep("User authenticated", { userId: userData.user.id, email: userData.user.email });

    // Check for existing Stripe customer or create new one
    let customerId: string | undefined;
    
    // Check if customer exists in our database
    const { data: subscriberData } = await supabaseClient
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (subscriberData?.stripe_customer_id) {
      customerId = subscriberData.stripe_customer_id;
      logStep("Using existing customer from subscribers table", { customerId });
    } else {
      // Check Stripe for customer with matching email
      const customers = await stripe.customers.list({
        email: userData.user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing Stripe customer", { customerId });
      } else {
        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: userData.user.email,
          name: userData.user.user_metadata?.full_name || userData.user.email,
          metadata: {
            userId: userData.user.id,
          },
        });
        customerId = newCustomer.id;
        logStep("Created new Stripe customer", { customerId });
      }

      // Update our database with the Stripe customer ID
      const { error: upsertError } = await supabaseClient
        .from('subscribers')
        .upsert({
          user_id: userData.user.id,
          email: userData.user.email,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) {
        logStep("Error upserting customer data", { error: upsertError.message });
      }
    }

    // Create a checkout session
    const baseUrl = new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: successUrl || `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/`,
      client_reference_id: userData.user.id, // IMPORTANTE: para associar o checkout ao usuário
      subscription_data: {
        metadata: {
          userId: userData.user.id
        }
      }
    });

    logStep("Checkout session created", { sessionId: session.id });
    
    // Return the checkout session URL
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
