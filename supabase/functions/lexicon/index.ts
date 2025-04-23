import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from "https://esm.sh/openai@4.24.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, word } = await req.json();
    // ID fixa do Assistant a ser usado
    const assistantId = 'asst_YLwvqvZmSOMwxaku53jtKAlt';

    // Inicializa cliente OpenAI com header global para v2
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
      baseOptions: {
        headers: { 'OpenAI-Beta': 'assistants=v2' }
      }
    });

    console.log(`Criando run para assistant ${assistantId} com query: ${word}`);
    // Cria o run
    const run = await openai.beta.threads.runs.create({
      assistant_id: assistantId,
      instructions: word
    });
    console.log('Run criado:', JSON.stringify(run, null, 2));

    const threadId = run.thread_id!;
    const runId = run.id;

    // Polling manual
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    let attempts = 0;
    const maxAttempts = 60;
    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      if (runStatus.required_actions) {
        for (const action of runStatus.required_actions) {
          if (action.type === 'tool_call' && action.tool.tool_name === 'file_system') {
            const toolCallId = action.tool_call_id;
            const path = action.parameters.path;
            console.log(`Enviando arquivo para tool_call_id ${toolCallId}, path: ${path}`);
            const fileContent = await Deno.readTextFile(path);
            await openai.beta.threads.runs.submitToolOutputs(threadId, runId, {
              tool_outputs: [{ tool_call_id: toolCallId, output: fileContent }]
            });
          }
        }
      }
      await new Promise(res => setTimeout(res, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      attempts++;
      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        throw new Error(`Run ${runStatus.status}: ${JSON.stringify(runStatus.last_error)}`);
      }
    }
    if (attempts >= maxAttempts) {
      throw new Error('Run expirou após aguardar 60 segundos');
    }

    // Recupera resposta
    const msgs = await openai.beta.threads.messages.list(threadId);
    console.log(`Mensagens no thread: ${msgs.data.length}`);

    const assistantMsg = msgs.data.find(m => m.role === 'assistant');
    if (!assistantMsg) throw new Error('Nenhuma mensagem do assistente encontrada');
    const textPart = assistantMsg.content.find(p => p.type === 'text');
    if (!textPart?.text?.value) throw new Error('Nenhum conteúdo de texto na mensagem do assistente');
    const reply = textPart.text.value;
    console.log(`Resposta: ${reply.substring(0, 50)}...`);

    // Persistência no Supabase com Service Role Key
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    try {
      await supa.from('lexicon_queries').select('user_id').limit(1);
    } catch {
      throw new Error('Verifique a existência da tabela lexicon_queries e colunas user_id, word, response');
    }
    const { error: insertError } = await supa.from('lexicon_queries').insert({ user_id: userId, word, response: { reply } });
    if (insertError) throw new Error('Falha ao inserir no lexicon_queries: ' + insertError.message);

    console.log('Consulta salva no Supabase');
    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Erro na função de léxico:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});