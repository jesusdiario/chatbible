
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função auxiliar para converter ArrayBuffer para Base64 de forma mais eficiente
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  
  // Processa em chunks pequenos para evitar estouro de stack
  const chunkSize = 8192;
  let base64 = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.length));
    base64 += String.fromCharCode.apply(null, [...chunk]);
  }
  
  return btoa(base64);
}

serve(async (req) => {
  // Registra início para medir performance
  const startTime = Date.now();
  console.log(`[${startTime}] Requisição de síntese de fala recebida`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error("OpenAI API key não configurada");
      throw new Error('OpenAI API key is not configured');
    }

    // Get the text and voice/model from the request
    const { text, voice = 'ash', model = 'tts-1' } = await req.json();

    if (!text || typeof text !== 'string') {
      console.error("Texto inválido ou ausente");
      throw new Error('Text is required and must be a string');
    }

    console.log(`[${Date.now() - startTime}ms] Sintetizando fala com voz: ${voice}, modelo: ${model}`);
    console.log(`[${Date.now() - startTime}ms] Tamanho do texto: ${text.length} caracteres`);
    
    // Verifica se o texto é muito longo (OpenAI tem um limite de aproximadamente 4096 tokens)
    // Como regra aproximada, 1 token ~= 4 caracteres em idiomas ocidentais
    const maxLength = 4000 * 4; // ~4000 tokens
    
    if (text.length > maxLength) {
      console.log(`[${Date.now() - startTime}ms] Texto excede o tamanho recomendado (${text.length} > ${maxLength})`);
      return new Response(JSON.stringify({
        error: 'O texto é muito longo para ser sintetizado. Por favor, reduza o tamanho do texto.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[${Date.now() - startTime}ms] Iniciando chamada para OpenAI API`);
    
    // Send to OpenAI's TTS API
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    console.log(`[${Date.now() - startTime}ms] Resposta recebida da OpenAI API: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[${Date.now() - startTime}ms] Erro na OpenAI API:`, errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    // Convert audio buffer to base64 usando método otimizado
    console.log(`[${Date.now() - startTime}ms] Iniciando conversão do áudio para base64`);
    const audioBuffer = await response.arrayBuffer();
    console.log(`[${Date.now() - startTime}ms] Buffer recebido, tamanho: ${audioBuffer.byteLength} bytes`);
    
    const base64Audio = arrayBufferToBase64(audioBuffer);
    
    console.log(`[${Date.now() - startTime}ms] Conversão para base64 concluída, tamanho: ${base64Audio.length} caracteres`);
    console.log(`[${Date.now() - startTime}ms] Síntese de fala concluída com sucesso`);

    // Return the audio as base64 to the client
    return new Response(JSON.stringify({ 
      audio: base64Audio,
      meta: {
        processingTimeMs: Date.now() - startTime,
        textLength: text.length,
        audioSizeBytes: audioBuffer.byteLength
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`[${errorTime}ms] Erro na função synthesize-speech:`, error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      meta: {
        processingTimeMs: errorTime
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
