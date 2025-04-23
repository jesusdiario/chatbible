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
    const { userId, word, assistantId } = await req.json();

    // Inicializa cliente OpenAI com header beta para v2
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
      defaultHeaders: { 'OpenAI-Beta': 'assistants=v2' }
    });

    console.log(`Executando createAndPoll para assistant ${assistantId} com query: ${word}`);

    // Executa o run e aguarda conclusão, tratando automaticamente required_actions
    const run = await openai.beta.threads.runs.createAndPoll({
      assistant_id: assistantId,
      instructions: word
    });
    console.log('Run completado:', JSON.stringify(run, null, 2));

    const threadId = run.thread_id!;

    // Recupera mensagens do thread e extrai resposta de texto
    const msgs = await openai.beta.threads.messages.list(threadId);
    console.log(`Mensagens no thread: ${msgs.data.length}`);

    const assistantMsg = msgs.data.find(m => m.role === 'assistant');
    if (!assistantMsg) {
      throw new Error('Nenhuma mensagem do assistente encontrada após createAndPoll');
    }

    const textPart = assistantMsg.content.find(p => p.type === 'text');
    if (!textPart?.text?.value) {
      throw new Error('Nenhum conteúdo de texto na mensagem do assistente');
    }

    const reply = textPart.text.value;
    console.log(`Resposta obtida: ${reply.substring(0, 50)}...`);

    // Armazena no Supabase usando Service Role Key (bypassa RLS)
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verifica se a tabela lexicon_queries existe com as colunas esperadas
    try {
      await supa.from('lexicon_queries').select('user_id').limit(1);
    } catch (err) {
      console.error('Erro verificando tabela lexicon_queries ou colunas:', err);
      throw new Error(
        'Tabela lexicon_queries não encontrada ou colunas user_id, word, response inexistentes; ' +
        'verifique o esquema e as políticas de RLS.'
      );
    }

    // Insere a consulta
    const { error: insertError } = await supa
      .from('lexicon_queries')
      .insert({ user_id: userId, word, response: { reply } });

    if (insertError) {
      console.error('Erro ao inserir no lexicon_queries:', insertError);
      throw new Error('Falha ao salvar consulta no banco de dados.');
    }
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