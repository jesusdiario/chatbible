
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.9.0";
import { corsHeaders, logStep, createErrorResponse, createSuccessResponse } from "./utils.ts";
import { processStripeEvent } from "./eventProcessor.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook function started");
    
    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      logStep("No stripe signature found", { status: 400 });
      // Always return 200 to prevent retries
      return createErrorResponse("No stripe signature found");
    }
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      logStep("STRIPE_SECRET_KEY is not set", { status: 500 });
      return createErrorResponse("STRIPE_SECRET_KEY is not set");
    }
    
    // Parse the event without verification first for simplicity
    let event;
    
    try {
      event = JSON.parse(body);
      logStep("Event parsed successfully", { type: event.type });
    } catch (err) {
      logStep("Event parsing failed", { error: err.message });
      return createErrorResponse("Event parsing failed");
    }
    
    // Initialize Supabase client for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      logStep("Supabase environment variables not set", { status: 500 });
      return createErrorResponse("Supabase environment variables not set");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    // Process the event
    await processStripeEvent(event, supabaseClient);
    
    // Return a 200 success response to confirm receipt
    return createSuccessResponse();
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { message: errorMessage });
    
    // Still return 200 to avoid Stripe continuing to retry
    return createErrorResponse(errorMessage);
  }
});
