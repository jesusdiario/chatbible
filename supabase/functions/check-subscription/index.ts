
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle OPTIONS requests for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Chave do Stripe não configurada");
    logStep("Chave do Stripe verificada");

    // Initialize the Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authorization from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Sem cabeçalho de autorização");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify authenticated user
    const token = authHeader.replace("Bearer ", "");
    logStep("Autenticando usuário com token");
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      logStep("Erro de autenticação", { error: userError });
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Usuário autenticado", { userId: user.id, email: user.email });
    
    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });
    
    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("Cliente não encontrado, atualizando estado sem assinatura");
      
      // Get the FREE plan ID
      const { data: freePlan } = await supabaseClient
        .from("price_plans")
        .select("id")
        .eq("code", "FREE")
        .single();
      
      if (!freePlan) {
        return new Response(JSON.stringify({ error: "Plano gratuito não encontrado" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }
      
      // Upsert customer with FREE plan
      await supabaseClient.from("customers").upsert(
        {
          user_id: user.id,
          email: user.email,
          current_plan_id: freePlan.id,
          current_status: "inactive",
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: "FREE",
        subscription_end: null,
        message_limit: 10
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Cliente Stripe encontrado", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = "FREE";
    let subscriptionEnd = null;
    let messageLimit = 10;
    let pricePlanId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Assinatura ativa encontrada", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Get price ID from subscription
      const priceId = subscription.items.data[0].price.id;
      
      // Look up price_plan_id from stripe_items table
      const { data: stripeItem } = await supabaseClient
        .from("stripe_items")
        .select("price_plan_id")
        .eq("stripe_price_id", priceId)
        .single();
        
      if (stripeItem) {
        pricePlanId = stripeItem.price_plan_id;
        
        // Get plan details
        const { data: planData } = await supabaseClient
          .from("price_plans")
          .select("*")
          .eq("id", pricePlanId)
          .single();
          
        if (planData) {
          subscriptionTier = planData.code;
          messageLimit = planData.message_limit;
          logStep("Plano determinado", { subscriptionTier, messageLimit });
        }
      } else {
        // Fallback: Get the PRO plan details if we can't find the specific price
        const { data: proPlan } = await supabaseClient
          .from("price_plans")
          .select("*")
          .eq("code", "PRO")
          .single();
          
        if (proPlan) {
          pricePlanId = proPlan.id;
          subscriptionTier = "PRO";
          messageLimit = proPlan.message_limit;
        }
        
        logStep("Plano não encontrado na base, usando fallback", { subscriptionTier });
      }
      
      // Update customer record
      await supabaseClient.from("customers").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        current_plan_id: pricePlanId,
        current_status: "active",
        current_period_end: subscriptionEnd,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      // Add to subscriptions history if needed
      const { data: existingSubscription } = await supabaseClient
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("stripe_subscription_id", subscription.id)
        .single();
        
      if (!existingSubscription) {
        await supabaseClient.from("subscriptions").insert({
          user_id: user.id,
          price_plan_id: pricePlanId,
          status: "active",
          period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          period_end: subscriptionEnd,
          stripe_subscription_id: subscription.id,
          created_at: new Date().toISOString()
        });
      }
    } else {
      // Get the FREE plan
      const { data: freePlan } = await supabaseClient
        .from("price_plans")
        .select("*")
        .eq("code", "FREE")
        .single();
      
      if (freePlan) {
        pricePlanId = freePlan.id;
        messageLimit = freePlan.message_limit;
      }
      
      logStep("Nenhuma assinatura ativa encontrada");
      
      // Update customer with FREE plan
      await supabaseClient.from("customers").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        current_plan_id: pricePlanId,
        current_status: "inactive",
        current_period_end: null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }

    // Get current usage
    const { data: usageData } = await supabaseClient.rpc(
      'check_message_quota',
      { user_id_param: user.id }
    );
    
    const canSendMessage = usageData || true; // Default to true if no data

    logStep("Base de dados atualizada com informações da assinatura", { 
      subscribed: hasActiveSub, 
      subscriptionTier, 
      messageLimit,
      canSendMessage
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      message_limit: messageLimit,
      can_send_message: canSendMessage
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO em check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
