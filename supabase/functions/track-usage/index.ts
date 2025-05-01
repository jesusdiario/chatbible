
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Initialize the Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Obtenha a autorização do cabeçalho
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar usuário autenticado
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extrair dados da solicitação
    const { endpoint, model, promptTokens, completionTokens, totalTokens } = await req.json();

    // Calcular custo estimado com base no modelo
    let costPerToken = 0;
    switch(model) {
      case "gpt-4":
        costPerToken = 0.00003; // Input: $0.03 per 1K tokens
        break;
      case "gpt-4-turbo":
        costPerToken = 0.00001; // Input: $0.01 per 1K tokens
        break;
      case "gpt-3.5-turbo":
        costPerToken = 0.0000015; // Input: $0.0015 per 1K tokens
        break;
      default:
        costPerToken = 0.000002; // Default value
    }

    // Calcular custo total estimado
    const estimatedCost = totalTokens * costPerToken;

    // Verificar assinatura do usuário
    const { data: subData, error: subError } = await supabaseClient
      .from('subscribers')
      .select('subscribed, subscription_tier, subscription_end')
      .eq('user_id', user.id)
      .single();

    // Buscar limites do plano
    const { data: planData } = await supabaseClient
      .from('subscription_plans')
      .select('message_limit')
      .eq('name', subData?.subscription_tier || 'Gratuito')
      .single();
      
    // Verificar se o usuário pode enviar outra mensagem
    const { data: userData, error: userDataError } = await supabaseClient
      .from('message_counts')
      .select('count, last_reset_time')
      .eq('user_id', user.id)
      .single();
      
    const messageLimit = planData?.message_limit || 10;
    const isSubscribed = subData?.subscribed || false;
    const currentCount = userData?.count || 0;
    
    // Verificar se o subscription_end mudou desde o último reset
    if (userData && subData?.subscription_end) {
      const lastResetTime = new Date(userData.last_reset_time);
      const subscriptionEndDate = new Date(subData.subscription_end);
      const previousSubscriptionEnd = new Date(lastResetTime);
      previousSubscriptionEnd.setMonth(previousSubscriptionEnd.getMonth() + 1);
      
      // Se a data de expiração mudou, resetamos a contagem
      if (subscriptionEndDate.getTime() !== previousSubscriptionEnd.getTime()) {
        console.log("Subscription end date changed, resetting message count");
        await supabaseClient
          .from('message_counts')
          .update({
            count: 0,
            last_reset_time: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }
    }
      
    if (currentCount >= messageLimit && !isSubscribed) {
      return new Response(JSON.stringify({ 
        error: "Limite de mensagens excedido",
        limitExceeded: true,
        currentCount: currentCount,
        limit: messageLimit
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Gravar registro de uso
    const { data, error } = await supabaseClient.from("api_usage").insert({
      user_id: user.id,
      endpoint,
      model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      estimated_cost_usd: estimatedCost,
    });

    if (error) {
      throw new Error(`Erro ao registrar uso: ${error.message}`);
    }

    // Incrementar contador de mensagens
    await supabaseClient.rpc('increment_message_count', { user_id_param: user.id });

    return new Response(JSON.stringify({ 
      success: true, 
      cost: estimatedCost,
      messageCount: currentCount + 1,
      messageLimit,
      canSendMore: (currentCount + 1) < messageLimit || isSubscribed
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Erro ao rastrear uso:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
