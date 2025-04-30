
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Lidar com requisições OPTIONS para CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    console.log("Create checkout iniciado");
    
    // Inicialize o cliente Supabase com a service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Obtenha a autorização do cabeçalho
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Erro de autorização: cabeçalho ausente");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar usuário autenticado
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      console.error("Erro de autenticação:", userError);
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Usuário autenticado: ${user.id}`);

    // Extrair dados da solicitação
    const requestData = await req.json();
    const { priceId, successUrl, cancelUrl } = requestData;
    
    console.log(`Dados da requisição: priceId=${priceId}, successUrl=${successUrl}, cancelUrl=${cancelUrl}`);
    
    if (!priceId) {
      console.error("ID do preço não fornecido");
      return new Response(JSON.stringify({ error: "ID do preço não fornecido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Obter o plano de assinatura da base de dados
    console.log(`Buscando plano com price_id: ${priceId}`);
    const { data: planData, error: planError } = await supabaseClient
      .from("subscription_plans")
      .select("*")
      .eq("stripe_price_id", priceId)
      .single();

    if (planError) {
      console.error("Erro ao buscar plano:", planError);
      return new Response(JSON.stringify({ error: `Plano não encontrado: ${planError.message}` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!planData) {
      console.error(`Plano com price_id ${priceId} não encontrado`);
      // Tente criar a sessão mesmo sem encontrar o plano no banco
    } else {
      console.log(`Plano encontrado: ${planData.name}`);
    }

    // Inicialize o Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("Chave do Stripe não configurada");
      return new Response(JSON.stringify({ error: "Erro de configuração do servidor" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2022-11-15",
    });

    // Verificar se o cliente já existe no Stripe
    console.log(`Buscando cliente com email: ${user.email}`);
    let customerId;
    const { data: customers } = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.length > 0) {
      customerId = customers[0].id;
      console.log(`Cliente existente encontrado: ${customerId}`);
    } else {
      // Criar um novo cliente no Stripe
      console.log("Criando novo cliente no Stripe");
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = newCustomer.id;
      console.log(`Novo cliente criado: ${customerId}`);
      
      // Registrar cliente no banco de dados
      await supabaseClient
        .from("subscribers")
        .upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: customerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    const origin = req.headers.get("origin") || "https://biblegpt.app";
    const defaultSuccessUrl = `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${origin}/profile`;
    
    // Criar a sessão de checkout do Stripe
    console.log(`Criando sessão de checkout para o cliente ${customerId} com price ${priceId}`);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || defaultSuccessUrl,
      cancel_url: cancelUrl || defaultCancelUrl,
      allow_promotion_codes: true,
      client_reference_id: user.id,
    });

    console.log(`Sessão de checkout criada: ${session.id}, URL: ${session.url}`);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Erro no checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
