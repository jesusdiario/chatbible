
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

    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    let userId: string | undefined;
    let userEmail: string | undefined;

    // Tenta obter usuário autenticado (se disponível)
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);

      if (!authError && userData.user) {
        userId = userData.user.id;
        userEmail = userData.user.email;
        logStep("User authenticated", { userId, email: userEmail });
      }
    }

    // Configurar o customer_id apenas se o usuário estiver autenticado
    let customerId: string | undefined;
    
    if (userEmail) {
      // Verifica se já existe um cliente no Stripe
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Using existing customer from Stripe", { customerId });
      } else {
        // Cria um novo cliente no Stripe
        const newCustomer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId: userId,
          },
        });
        customerId = newCustomer.id;
        logStep("Created new Stripe customer", { customerId });
      }

      // Se o usuário está autenticado, atualiza o banco de dados
      if (userId) {
        const { error: upsertError } = await supabaseClient
          .from('subscribers')
          .upsert({
            user_id: userId,
            email: userEmail,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          });

        if (upsertError) {
          logStep("Error upserting customer data", { error: upsertError.message });
        }
      }
    }

    // Criar sessão de checkout
    const baseUrl = new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: !customerId ? userEmail : undefined,
      allow_promotion_codes: true,
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      mode: 'subscription',
      success_url: successUrl || `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${baseUrl}/`,
      metadata: {
        userId: userId || "anonymous"
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
