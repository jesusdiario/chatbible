
// Criando o arquivo check-subscription para verificar o status da assinatura
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper para logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use a service role key para realizar escritas no Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Função iniciada");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não está configurada");
    logStep("Chave do Stripe verificada");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Cabeçalho de autorização não fornecido");
    logStep("Cabeçalho de autorização encontrado");

    const token = authHeader.replace("Bearer ", "");
    logStep("Autenticando usuário com token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado ou email não disponível");
    logStep("Usuário autenticado", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2022-11-15" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("Nenhum cliente encontrado, atualizando estado não assinado");
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });
      
      // Buscar os detalhes do plano gratuito
      const { data: freePlan } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Gratuito')
        .single();
        
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: "Gratuito",
        subscription_end: null,
        message_limit: freePlan?.message_limit || 10,
        subscription_data: freePlan || null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Cliente Stripe encontrado", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = "Gratuito";
    let subscriptionEnd = null;
    let subscriptionData = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Assinatura ativa encontrada", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      // Determinar o nível de assinatura a partir do preço
      const priceId = subscription.items.data[0].price.id;
      
      // Buscar o plano correspondente no banco de dados
      const { data: planData, error: planError } = await supabaseClient
        .from("subscription_plans")
        .select("*")
        .eq("stripe_price_id", priceId)
        .single();
      
      if (planError) {
        logStep("Erro ao buscar plano", { error: planError });
        
        // Fallback para o plano Premium se não encontrar o plano específico
        const { data: premiumPlan } = await supabaseClient
          .from('subscription_plans')
          .select('*')
          .eq('name', 'Premium')
          .single();
          
        subscriptionTier = premiumPlan?.name || "Premium";
        subscriptionData = premiumPlan;
      } else if (planData) {
        subscriptionTier = planData.name;
        subscriptionData = planData;
        logStep("Plano encontrado", { planName: planData.name });
      } else {
        // Fallback para o plano Premium se não encontrar o plano específico
        const { data: premiumPlan } = await supabaseClient
          .from('subscription_plans')
          .select('*')
          .eq('name', 'Premium')
          .single();
          
        subscriptionTier = premiumPlan?.name || "Premium";
        subscriptionData = premiumPlan;
      }
    } else {
      logStep("Nenhuma assinatura ativa encontrada");
      
      // Buscar os detalhes do plano gratuito
      const { data: freePlan } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Gratuito')
        .single();
        
      subscriptionData = freePlan;
    }

    // Atualizar os dados do assinante no banco
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    logStep("Banco de dados atualizado com informações da assinatura", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      message_limit: subscriptionData?.message_limit || 10,
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
