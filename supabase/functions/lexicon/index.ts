
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

    // Configurar API OpenAI com cabeçalho beta para v2
    const openai = new OpenAI({ 
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
      defaultHeaders: {
        'OpenAI-Beta': 'assistants=v2'
      }
    })
    
    console.log(`Creating thread for lexicon query: "${word}"`);

    // Create a thread with v2 API
    const thread = await openai.beta.threads.create({});
    console.log(`Thread created: ${thread.id}`);

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: word
    });
    console.log("Added user message to thread");

    // Run the assistant on the thread with v2 API
    console.log(`Starting assistant run with assistant ID: ${assistantId}`);
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    console.log(`Initial run status: ${runStatus.status}`);
    
    let attempts = 0;
    const maxAttempts = 60; // Maximum 60 seconds of waiting
    
    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
      
      if (attempts % 5 === 0) {
        console.log(`Run status after ${attempts} seconds: ${runStatus.status}`);
      }
      
      if (runStatus.status === 'failed') {
        const errorDetails = JSON.stringify(runStatus.last_error || {});
        console.error(`Assistant run failed: ${errorDetails}`);
        throw new Error(`Assistant run failed: ${errorDetails}`);
      }
      
      // Check for other failure states
      if (['cancelled', 'expired', 'failed'].includes(runStatus.status)) {
        const errorDetails = JSON.stringify(runStatus.last_error || {});
        console.error(`Assistant run ${runStatus.status}: ${errorDetails}`);
        throw new Error(`Assistant run ${runStatus.status}: ${errorDetails}`);
      }
    }

    if (attempts >= maxAttempts) {
      console.error("Run timed out after waiting too long");
      throw new Error("Run timed out after waiting too long");
    }

    // Get the latest message from the assistant
    console.log("Retrieving assistant response");
    const threadsListResponse = await openai.beta.threads.messages.list(thread.id);
    
    // Log the response structure to debug
    console.log(`Response received with ${threadsListResponse.data.length} messages`);
    
    // Find the assistant's message (there might be multiple messages)
    const assistantMessages = threadsListResponse.data.filter(msg => msg.role === 'assistant');
    
    if (!assistantMessages.length) {
      console.error("No assistant messages found in the response");
      throw new Error("No assistant messages found in the response");
    }
    
    const lastMessage = assistantMessages[0];
    
    if (!lastMessage.content || lastMessage.content.length === 0) {
      console.error("Assistant message has no content");
      throw new Error("No response content received from assistant");
    }
    
    // Make sure we're extracting text content correctly
    const textContent = lastMessage.content.find(item => item.type === 'text');
    
    if (!textContent || !textContent.text || !textContent.text.value) {
      console.error("No text content found in the assistant's response");
      throw new Error("No text content found in the assistant's response");
    }
    
    const reply = textContent.text.value;
    console.log(`Successful response received: ${reply.substring(0, 50)}...`);

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
    
    console.log("Query stored in database");

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
