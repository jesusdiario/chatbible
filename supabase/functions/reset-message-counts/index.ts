
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This function should be called on a schedule to check and reset message counts
// for users with updated subscription_end dates

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Initialize the Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all users with message counts
    const { data: messageCounts, error: countsError } = await supabaseClient
      .from('message_counts')
      .select('user_id, last_reset_time');

    if (countsError) {
      throw new Error(`Error fetching message counts: ${countsError.message}`);
    }

    const updates = [];

    // Check each user's subscription end date
    for (const count of messageCounts) {
      const { data: subscriber, error: subError } = await supabaseClient
        .from('subscribers')
        .select('subscription_end')
        .eq('user_id', count.user_id)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error(`Error fetching subscriber ${count.user_id}: ${subError.message}`);
        continue;
      }

      if (!subscriber || !subscriber.subscription_end) {
        continue;
      }

      const lastReset = new Date(count.last_reset_time);
      const subscriptionEnd = new Date(subscriber.subscription_end);

      // If the subscription_end is more recent than the last reset, reset the count
      if (lastReset < subscriptionEnd) {
        updates.push({
          user_id: count.user_id,
          reason: 'subscription_renewed'
        });

        await supabaseClient
          .from('message_counts')
          .update({
            count: 0,
            last_reset_time: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', count.user_id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reset ${updates.length} users' message counts`,
        updates
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error resetting message counts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
