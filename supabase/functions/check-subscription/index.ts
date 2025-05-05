
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Função iniciada");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY não está configurada");
    logStep("Stripe API key verificada");

    // Inicializar Supabase com a service role key para leitura e escrita
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variáveis de ambiente do Supabase não estão configuradas");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
    logStep("Cliente Supabase inicializado");

    // Autenticar usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Header de autorização ausente");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) throw new Error(`Erro de autenticação: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("Usuário não autenticado ou email não disponível");
    logStep("Usuário autenticado", { id: user.id, email: user.email });

    // Inicializar Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Buscar cliente no Stripe usando o email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("Nenhum cliente Stripe encontrado para este usuário");
      
      // Atualizar ou criar registro na tabela subscribers
      await supabase.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        subscribed: false,
        subscription_tier: "Gratuito",
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });
      
      // Buscar detalhes do plano gratuito
      const { data: freePlan } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("name", "Gratuito")
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

    // Cliente existe no Stripe
    const customerId = customers.data[0].id;
    logStep("Cliente Stripe encontrado", { customerId });

    // Buscar assinaturas ativas deste cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    // Verificar se tem uma assinatura ativa
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = "Gratuito";
    let subscriptionEnd = null;
    let priceId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Obter o ID do preço para determinar o nível da assinatura
      priceId = subscription.items.data[0].price.id;
      
      // Buscar informações do plano no banco de dados com base no stripe_price_id
      const { data: planData } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("stripe_price_id", priceId)
        .single();
      
      if (planData) {
        subscriptionTier = planData.name;
        logStep("Plano de assinatura encontrado", { 
          tier: subscriptionTier, 
          priceId,
          endDate: subscriptionEnd
        });
      } else {
        logStep("Plano não encontrado para o priceId", { priceId });
        subscriptionTier = "Premium"; // Fallback para Premium caso não encontre o plano específico
      }
    } else {
      logStep("Nenhuma assinatura ativa encontrada");
    }

    // Atualizar ou criar registro na tabela subscribers
    await supabase.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" });
    
    logStep("Registro do assinante atualizado", { 
      userId: user.id,
      subscribed: hasActiveSub,
      tier: subscriptionTier
    });

    // Buscar detalhes completos do plano atual
    const { data: planDetails } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("name", subscriptionTier)
      .single();

    // Retornar informações da assinatura
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      message_limit: planDetails?.message_limit || 10,
      subscription_data: planDetails || null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO na função check-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
