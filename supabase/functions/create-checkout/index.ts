
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
    const { priceId, email, password, name, successUrl, cancelUrl } = await req.json();
    logStep("Request received", { priceId, email, name, successUrl, cancelUrl });

    if (!email) {
      throw new Error('Email is required for checkout');
    }

    // Get STRIPE_SECRET_KEY from environment variable
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16'
    });

    // Get supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Check if the user already exists in Supabase
    const { data: userExistsData, error: userExistsError } = await supabaseClient.auth.admin.getUserByEmail(email);
    
    if (userExistsError && userExistsError.message !== 'User not found') {
      throw new Error('Error checking user existence: ' + userExistsError.message);
    }
    
    // Determine if user already exists
    const userExists = !!userExistsData?.user;
    logStep("User existence check", { exists: userExists });

    // Create a new Stripe checkout session
    const baseUrl = new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: successUrl || `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/`,
      customer_creation: 'always',
      metadata: {
        email,
        password: password || '', // Only used if creating a new account
        name: name || email.split('@')[0],
        create_account: userExists ? 'false' : 'true'
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
