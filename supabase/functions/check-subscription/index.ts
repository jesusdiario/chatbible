
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
  // Lidar com requisições OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    logStep("Função iniciada");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Chave do Stripe não configurada");
    logStep("Chave do Stripe verificada");

    // Initialize the Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Obtenha a autorização do cabeçalho
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("Sem cabeçalho de autorização");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar usuário autenticado
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
    
    // Inicialize o Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });
    
    // Verificar se o cliente existe no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("Cliente não encontrado, atualizando estado sem assinatura");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      // Obter o plano gratuito
      const { data: freePlan } = await supabaseClient
        .from("subscription_plans")
        .select("*")
        .eq("stripe_price_id", "free_plan")
        .single();
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: "Gratuito",
        subscription_end: null,
        message_limit: freePlan?.message_limit || 10
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Cliente Stripe encontrado", { customerId });

    // Verificar assinaturas ativas
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = "Gratuito";
    let subscriptionEnd = null;
    let messageLimit = 10;
    let subscriptionData = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Assinatura ativa encontrada", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determinar plano de assinatura com base no preço
      const priceId = subscription.items.data[0].price.id;
      
      // Buscar plano na base de dados
      const { data: planData } = await supabaseClient
        .from("subscription_plans")
        .select("*")
        .eq("stripe_price_id", priceId)
        .single();
      
      if (planData) {
        subscriptionTier = planData.name;
        messageLimit = planData.message_limit;
        subscriptionData = planData;
        logStep("Plano determinado", { subscriptionTier, messageLimit });
      } else {
        // Fallback para o plano Pro se o plano não for encontrado na base
        subscriptionTier = "Pro";
        messageLimit = 200;
        logStep("Plano não encontrado na base, usando fallback", { subscriptionTier });
      }
    } else {
      // Obter o plano gratuito
      const { data: freePlan } = await supabaseClient
        .from("subscription_plans")
        .select("*")
        .eq("stripe_price_id", "free_plan")
        .single();
      
      if (freePlan) {
        messageLimit = freePlan.message_limit;
        subscriptionData = freePlan;
      }
      
      logStep("Nenhuma assinatura ativa encontrada");
    }

    // Atualizar registro do assinante
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Base de dados atualizada com informações da assinatura", { 
      subscribed: hasActiveSub, 
      subscriptionTier, 
      messageLimit 
    });
    
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      message_limit: messageLimit,
      subscription_data: subscriptionData
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
