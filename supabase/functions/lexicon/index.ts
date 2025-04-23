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
    const { userId, word, assistantId } = await req.json()

    // Inicializa cliente OpenAI com header beta para v2
    const openai = new OpenAI({ 
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
      defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
    })

    console.log(`Starting run for assistant ${assistantId} with query: ${word}`)

    // Cria e dispara o run em uma só chamada, herdando System Instructions configuradas no Assistente
    const run = await openai.beta.threads.runs.create({
      assistant_id: assistantId,
      thread: {
        messages: [
          { role: 'user', content: word }
        ]
      }
    })
    console.log(`Run created: ${run.id}`)

    // Polling até completar ou requerer ação de ferramenta
    let runStatus = await openai.beta.threads.runs.retrieve(run.thread_id!, run.id)
    let attempts = 0
    const maxAttempts = 60

    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      // Se precisar de ação (ex: File System), trate aqui
      if (runStatus.required_actions) {
        for (const action of runStatus.required_actions) {
          if (action.type === 'tool_call' && action.tool.tool_name === 'file_system') {
            const toolCallId = action.tool_call_id
            // Exemplo: leia arquivo local e envie de volta ao Assistente
            const fileContent = await Deno.readTextFile(action.parameters.path)
            await openai.beta.threads.runs.submitToolOutputs(run.thread_id!, run.id, {
              tool_outputs: [ { tool_call_id: toolCallId, output: fileContent } ]
            })
            console.log(`Submitted file_system output for tool_call_id ${toolCallId}`)
          }
        }
      }

      // Aguarda 1s e refaz retrieve
      await new Promise(res => setTimeout(res, 1000))
      runStatus = await openai.beta.threads.runs.retrieve(run.thread_id!, run.id)
      attempts++
      if (attempts % 5 === 0) console.log(`Status after ${attempts}s: ${runStatus.status}`)
      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        throw new Error(`Run ${runStatus.status}: ${JSON.stringify(runStatus.last_error)}`)
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Run timed out after 60 seconds')
    }

    // Recupera mensagens e extrai resposta de texto
    const msgs = await openai.beta.threads.messages.list(run.thread_id!)
    const assistantMsg = msgs.data.find(m => m.role === 'assistant')
    if (!assistantMsg) throw new Error('No assistant message found')

    const textPart = assistantMsg.content.find(p => p.type === 'text')
    if (!textPart?.text?.value) throw new Error('No text content in assistant message')

    const reply = textPart.text.value
    console.log(`Reply: ${reply.slice(0, 50)}...`)

    // Armazena no Supabase
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    await supa.from('lexicon_queries').insert({ user_id: userId, word, response: { reply } })
    console.log('Query saved to Supabase')

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Error in lexicon function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
