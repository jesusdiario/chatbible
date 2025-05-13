
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://esm.sh/openai@4.24.7";

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
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
    });

    const { sourceJson, targetLanguage = 'en', chunkSize = 10 } = await req.json();

    if (!sourceJson || typeof sourceJson !== 'object') {
      throw new Error('Arquivo de tradução base inválido ou não fornecido');
    }

    console.log(`Iniciando tradução para ${targetLanguage} com ${Object.keys(sourceJson).length} chaves`);

    // Função para processar um grupo de chaves
    async function translateChunk(chunk: Record<string, any>, parentKey = '') {
      const result: Record<string, any> = {};
      
      // Para cada chave no chunk atual
      for (const [key, value] of Object.entries(chunk)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        
        // Se o valor for um objeto, processa recursivamente
        if (value !== null && typeof value === 'object') {
          result[key] = await translateChunk(value, fullKey);
        } 
        // Se for um texto, traduz
        else if (typeof value === 'string') {
          result[key] = value;
        } 
        // Outros tipos de valores são mantidos como estão
        else {
          result[key] = value;
        }
      }
      
      // Traduz todos os textos de uma vez usando a API da OpenAI
      const textsToTranslate = Object.entries(result)
        .filter(([_, value]) => typeof value === 'string')
        .map(([key, value]) => ({ key, value }));
      
      if (textsToTranslate.length > 0) {
        const prompt = `Traduza os seguintes textos de português para ${targetLanguage === 'en' ? 'inglês' : targetLanguage}. 
Mantenha os mesmos sentimentos, tom e formalidade do texto original. 
Forneça apenas as traduções, sem explicações adicionais, em formato JSON válido.

${JSON.stringify(textsToTranslate.map(item => ({ key: item.key, text: item.value })), null, 2)}`;

        console.log(`Traduzindo chunk com ${textsToTranslate.length} textos`);
        
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { 
                role: "system", 
                content: "Você é um assistente de tradução profissional especializado em traduzir interfaces de usuário e conteúdo web. Sempre mantenha o mesmo significado, formato e tags HTML (se existirem) do texto original." 
              },
              { role: "user", content: prompt }
            ],
            temperature: 0.3,
          });

          const translationText = completion.choices[0].message.content;
          
          try {
            const translations = JSON.parse(translationText);
            
            // Atualiza o resultado com as traduções
            for (const translation of translations) {
              if (translation.key && translation.text) {
                result[translation.key] = translation.text;
              }
            }
            
          } catch (parseError) {
            console.error("Erro ao analisar a resposta da tradução:", parseError);
            console.log("Resposta recebida:", translationText);
          }
        } catch (openaiError) {
          console.error("Erro na API da OpenAI:", openaiError);
        }
      }
      
      return result;
    }

    // Divide o objeto em chunks para evitar limites da API
    const processChunks = async (obj: Record<string, any>) => {
      const keys = Object.keys(obj);
      const result: Record<string, any> = {};
      
      // Processa em chunks menores
      for (let i = 0; i < keys.length; i += chunkSize) {
        const chunkKeys = keys.slice(i, i + chunkSize);
        const chunk: Record<string, any> = {};
        
        for (const key of chunkKeys) {
          chunk[key] = obj[key];
        }
        
        console.log(`Processando chunk ${i/chunkSize + 1} de ${Math.ceil(keys.length/chunkSize)}`);
        const translatedChunk = await translateChunk(chunk);
        
        // Mescla no resultado final
        Object.assign(result, translatedChunk);
      }
      
      return result;
    };

    // Inicia o processamento
    const translatedJson = await processChunks(sourceJson);
    
    console.log("Tradução concluída com sucesso");
    
    return new Response(
      JSON.stringify({ 
        success: true,
        translatedJson 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error("Erro na função de tradução:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
