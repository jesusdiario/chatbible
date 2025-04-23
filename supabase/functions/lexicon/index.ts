import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from "https://esm.sh/openai@4.24.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Caso queira sobrescrever ou reforçar as System Instructions, ajuste aqui:
const SYSTEM_INSTRUCTIONS = `INCLUA_AQUI_AS_SUA_INSTRUÇÕES_DE_SISTEMA_DO_ASSISTENTE`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, word, assistantId } = await req.json();

    // Inicializa cliente OpenAI com header beta para v2
    const openai = new OpenAI({ 
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
      defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
    });

    console.log(`Iniciando run para assistant ${assistantId} com query: ${word}`);

    // Cria o run em uma única chamada, incluindo System + User messages
    const run = await openai.beta.threads.runs.create({
      assistant_id: assistantId,
      thread: {
        messages: [
          { role: 'system', content: SYSTEM_INSTRUCTIONS },
          { role: 'user', content: word }
        ]
      }
    });

    // Log completo do objeto run para diagnóstico
    console.log('Run object:', JSON.stringify(run, null, 2));

    const threadId = run.thread_id!;
    const runId = run.id;

    // Polling até completar ou requerer ação de ferramenta
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    let attempts = 0;
    const maxAttempts = 60;

    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      // Trata required_actions (ex: file_system)
      if (runStatus.required_actions) {
        for (const action of runStatus.required_actions) {
          if (action.type === 'tool_call' && action.tool.tool_name === 'file_system') {
            const toolCallId = action.tool_call_id;
            console.log(`Tool call pendente: ${toolCallId}, path: ${action.parameters.path}`);
            const fileContent = await Deno.readTextFile(action.parameters.path);
            await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
              tool_outputs: [ { tool_call_id: toolCallId, output: fileContent } ]
            });
            console.log(`Output enviado para tool_call_id ${toolCallId}`);
          }
        }
      }

      // Aguarda 1s e refaz retrieve
      await new Promise(res => setTimeout(res, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      attempts++;
      if (attempts % 5 === 0) console.log(`Status após ${attempts}s: ${runStatus.status}`);
      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        throw new Error(`Run ${runStatus.status}: ${JSON.stringify(runStatus.last_error)}`);
      }
    }

    if (attempts >= maxAttempts) {
      throw new Error('Run expirou após 60 segundos de espera');
    }

    // Recupera mensagens do thread e extrai resposta de texto
    const msgs = await openai.beta.threads.messages.list(threadId);
    console.log(`Mensagens no thread: ${msgs.data.length}`);

    const assistantMsg = msgs.data
      .filter(m => m.role === 'assistant')
      .shift();
    if (!assistantMsg) throw new Error('Nenhuma mensagem do assistente encontrada');

    const textPart = assistantMsg.content.find(p => p.type === 'text');
    if (!textPart?.text?.value) throw new Error('Nenhum conteúdo de texto na mensagem do assistente');

    const reply = textPart.text.value;
    console.log(`Resposta obtida: ${reply.substring(0, 50)}...`);

    // Armazena no Supabase
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    await supa.from('lexicon_queries').insert({ user_id: userId, word, response: { reply } });
    console.log('Consulta salva no Supabase');

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na função de léxico:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
