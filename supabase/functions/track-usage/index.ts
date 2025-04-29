
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

    return new Response(JSON.stringify({ success: true, cost: estimatedCost }), {
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
