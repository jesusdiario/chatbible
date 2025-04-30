
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRACK-USAGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle OPTIONS requests for CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    logStep("Function started");
    
    // Initialize the Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authorization from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    logStep("Usuário autenticado", { userId: user.id });

    // Extract data from request
    const { usage_type, amount, context } = await req.json();

    if (!usage_type || !amount) {
      return new Response(JSON.stringify({ error: "Tipo de uso e quantidade são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user has a customer record, create if not exists
    const { data: customer } = await supabaseClient
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .single();
      
    if (!customer) {
      // Get the FREE plan
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
      
      // Create customer record with FREE plan
      await supabaseClient.from("customers").insert({
        user_id: user.id,
        email: user.email,
        current_plan_id: freePlan.id,
        current_status: "inactive"
      });
      
      logStep("Cliente criado com plano gratuito", { userId: user.id });
    }

    // Check if the user can send more messages
    const { data: canSendMessage } = await supabaseClient.rpc(
      'check_message_quota',
      { user_id_param: user.id }
    );
    
    // If not subscribed and over quota, return error
    if (customer?.current_status !== 'active' && !canSendMessage) {
      return new Response(JSON.stringify({ 
        error: "Limite de mensagens excedido", 
        limitExceeded: true,
        canSendMessage: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Record the usage
    const { data: usage, error: usageError } = await supabaseClient
      .from("usages")
      .insert({
        user_id: user.id,
        usage_type,
        amount,
        context
      })
      .select()
      .single();

    if (usageError) {
      throw new Error(`Erro ao registrar uso: ${usageError.message}`);
    }

    // Get current usage statistics
    const { data: currentUsage } = await supabaseClient
      .from("v_current_usage")
      .select("msgs_used, message_limit")
      .eq("user_id", user.id)
      .single();

    return new Response(JSON.stringify({ 
      success: true,
      usage_id: usage.id,
      current_usage: currentUsage?.msgs_used || amount,
      limit: currentUsage?.message_limit || 10,
      canSendMessage: canSendMessage !== false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Erro ao rastrear uso", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
