
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Obter o IP real do usuário
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
    
    // Usar API pública gratuita para obter informações de geolocalização
    const geoResponse = await fetch(`https://ipapi.co/${clientIP}/json/`);
    const geoData = await geoResponse.json();
    
    const country = geoData.country_code || 'BR'; // Padrão para Brasil se não for possível detectar
    
    return new Response(
      JSON.stringify({
        country: country,
        ip: clientIP,
        city: geoData.city || null,
        region: geoData.region || null,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Erro ao detectar país:', error);
    
    return new Response(
      JSON.stringify({ 
        country: 'BR',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
