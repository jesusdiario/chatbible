
// CORS headers for API response
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
export const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

// Create error response with consistent format
export const createErrorResponse = (message: string, status: number = 200) => {
  return new Response(JSON.stringify({ received: true, error: message }), {
    status: status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
};

// Create success response with consistent format
export const createSuccessResponse = () => {
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
};
