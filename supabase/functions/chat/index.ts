
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const respondWithError = (message: string, status = 500) => {
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { messages, systemPrompt } = await req.json()
    
    const finalMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: finalMessages,
        temperature: 0.7,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Error calling OpenAI API')
    }

    // Configurar streaming
    const stream = response.body
    const reader = stream?.getReader()
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Criar stream de resposta
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          if (!reader) throw new Error('No reader available')
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
              if (line.includes('[DONE]')) continue
              if (!line.startsWith('data: ')) continue

              const data = line.replace('data: ', '')
              try {
                const json = JSON.parse(data)
                const token = json.choices[0]?.delta?.content || ''
                if (token) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: token })}\n\n`))
                }
              } catch (err) {
                console.error('Error parsing JSON:', err)
              }
            }
          }
        } catch (error) {
          console.error('Error in stream processing:', error)
          controller.error(error)
        } finally {
          controller.close()
          reader.releaseLock()
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    })

  } catch (error) {
    console.error('Error in chat function:', error)
    return respondWithError(error.message)
  }
})
