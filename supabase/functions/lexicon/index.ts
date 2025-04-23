
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from "https://esm.sh/openai@4.24.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, userId, word, assistantId } = await req.json()

    // Configurar o cliente OpenAI com o cabeçalho beta para v2
    const openai = new OpenAI({ 
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
      defaultHeaders: {
        'OpenAI-Beta': 'assistants=v2'
      }
    })
    
    // Create a thread
    const thread = await openai.beta.threads.create();

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: word
    });

    // Run the assistant on the thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      
      if (runStatus.status === 'failed') {
        throw new Error('Assistant run failed: ' + JSON.stringify(runStatus.last_error));
      }
      
      // Adicionar verificação para outros status de falha
      if (['cancelled', 'expired', 'failed'].includes(runStatus.status)) {
        throw new Error(`Assistant run ${runStatus.status}: ${JSON.stringify(runStatus.last_error)}`);
      }
    }

    // Get the latest message from the assistant
    const threadMessages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = threadMessages.data[0];
    
    if (!lastMessage || !lastMessage.content || lastMessage.content.length === 0) {
      throw new Error('No response received from assistant');
    }
    
    const reply = lastMessage.content[0].text.value;

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Store the query
    await supabaseClient
      .from('lexicon_queries')
      .insert({
        user_id: userId,
        word,
        response: { reply }
      })

    return new Response(
      JSON.stringify({ reply }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in lexicon function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
