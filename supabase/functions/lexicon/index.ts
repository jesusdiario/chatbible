import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from "https://esm.sh/openai@4.24.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cabeçalho necessário para usar Assistants API v2
const BETA_HEADER = { 'OpenAI-Beta': 'assistants=v2' };

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const assistantId = body.assistantId || Deno.env.get('DEFAULT_ASSISTANT_ID');
    const userId = body.userId;
    const word = body.word;

    if (!assistantId) {
      throw new Error('assistantId não fornecido na requisição nem em DEFAULT_ASSISTANT_ID');
    }

    // Inicializa cliente OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
      // defaultHeaders não está funcionando para v2 em algumas versões
      // Vamos enviar extra_headers em cada chamada abaixo
    });

    console.log(`Criando run para assistant ${assistantId} com query: ${word}`);
    // Cria o run com header v2
    const run = await openai.beta.threads.runs.create(
      {
        assistant_id: assistantId,
        instructions: word
      },
      { extra_headers: BETA_HEADER }
    );
    console.log('Run criado:', JSON.stringify(run, null, 2));

    const threadId = run.thread_id!;
    const runId = run.id;

    // Polling manual, passando extra_headers em cada chamada
    let runStatus = await openai.beta.threads.runs.retrieve(
      threadId,
      runId,
      { extra_headers: BETA_HEADER }
    );
    let attempts = 0;
    const maxAttempts = 60;
    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      if (runStatus.required_actions) {
        for (const action of runStatus.required_actions) {
          if (action.type === 'tool_call' && action.tool.tool_name === 'file_system') {
            const toolCallId = action.tool_call_id;
            const path = action.parameters.path;
            console.log(`Enviando conteúdo de arquivo para tool_call_id ${toolCallId}, path: ${path}`);
            const fileContent = await Deno.readTextFile(path);
            await openai.beta.threads.runs.submitToolOutputs(
              threadId,
              runId,
              { tool_outputs: [{ tool_call_id: toolCallId, output: fileContent }] },
              { extra_headers: BETA_HEADER }
            );
          }
        }
      }
      await new Promise(res => setTimeout(res, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(
        threadId,
        runId,
        { extra_headers: BETA_HEADER }
      );
      attempts++;
      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        throw new Error(`Run ${runStatus.status}: ${JSON.stringify(runStatus.last_error)}`);
      }
    }
    if (attempts >= maxAttempts) {
      throw new Error('Run expirou após aguardar 60 segundos');
    }

    // Recupera resposta, listando mensagens com header v2
    const msgs = await openai.beta.threads.messages.list(
      threadId,
      { extra_headers: BETA_HEADER }
    );
    console.log(`Mensagens no thread: ${msgs.data.length}`);

    const assistantMsg = msgs.data.find(m => m.role === 'assistant');
    if (!assistantMsg) throw new Error('Nenhuma mensagem do assistente encontrada');
    const textPart = assistantMsg.content.find(p => p.type === 'text');
    if (!textPart?.text?.value) throw new Error('Nenhum conteúdo de texto na mensagem do assistente');
    const reply = textPart.text.value;
    console.log(`Resposta: ${reply.substring(0, 50)}...`);

    // Persistência no Supabase usando Service Role Key
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    // Verifica tabela
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