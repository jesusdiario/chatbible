import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configurações OpenAI
const API_KEY = Deno.env.get('OPENAI_API_KEY')!;
const API_BASE = 'https://api.openai.com/v1beta';
const ASSISTANT_ID = 'asst_YLwvqvZmSOMwxaku53jtKAlt';
const BETA_HEADER = { 'OpenAI-Beta': 'assistants=v2' };

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, word } = await req.json();
    if (!word) throw new Error('Parâmetro "word" é obrigatório');

    // 1) Cria o run via threads.runs endpoint
    const createRes = await fetch(
      `${API_BASE}/threads/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          ...BETA_HEADER
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID,
          instructions: word
        })
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Falha ao criar run: ${errText}`);
    }

    const run = await createRes.json();
    console.log('Run criado:', run);
    const threadId = run.thread_id;
    const runId = run.id;

    // 2) Polling do status até completion
    let attempts = 0;
    let status = run.status;

    while (status !== 'completed' && attempts < 60) {
      const statRes = await fetch(
        `${API_BASE}/threads/${threadId}/runs/${runId}`,
        { headers: { 'Authorization': `Bearer ${API_KEY}`, ...BETA_HEADER } }
      );

      if (!statRes.ok) {
        const errText = await statRes.text();
        throw new Error(`Erro ao consultar status: ${errText}`);
      }

      const statJson = await statRes.json();
      status = statJson.status;

      // Handle tool actions
      if (statJson.required_actions) {
        for (const action of statJson.required_actions) {
          if (action.type === 'tool_call' && action.tool.tool_name === 'file_system') {
            const content = await Deno.readTextFile(action.parameters.path);
            await fetch(
              `${API_BASE}/threads/${threadId}/runs/${runId}/tool-outputs`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${API_KEY}`,
                  'Content-Type': 'application/json',
                  ...BETA_HEADER
                },
                body: JSON.stringify({
                  tool_outputs: [{ tool_call_id: action.tool_call_id, output: content }]
                })
              }
            );
          }
        }
      }

      if (statJson.status === 'failed') {
        throw new Error('Run falhou');
      }
      if (['cancelled', 'expired'].includes(statJson.status)) {
        throw new Error(`Run ${statJson.status}`);
      }

      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }

    if (status !== 'completed') {
      throw new Error('Timeout aguardando run completion');
    }

    // 3) Lista mensagens
    const msgRes = await fetch(
      `${API_BASE}/threads/${threadId}/messages`,
      { headers: { 'Authorization': `Bearer ${API_KEY}`, ...BETA_HEADER } }
    );

    if (!msgRes.ok) {
      const errText = await msgRes.text();
      throw new Error(`Falha ao listar mensagens: ${errText}`);
    }

    const msgs = await msgRes.json();
    console.log('Messages:', msgs);
    const assistantMsg = msgs.data.find((m:any) => m.role === 'assistant');
    if (!assistantMsg) throw new Error('Nenhuma mensagem do assistente');

    const textObj = assistantMsg.content.find((c:any) => c.type === 'text');
    const reply = textObj?.text?.value;
    if (!reply) throw new Error('Conteúdo de texto não encontrado');

    // 4) Persiste em Supabase
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Insere e confere erros
    const { error: insertError } = await supa
      .from('lexicon_queries')
      .insert({ user_id: userId, word, response: { reply } });

    if (insertError) {
      console.error('Erro ao inserir no Supabase:', insertError);
      throw new Error('Falha ao salvar consulta');
    }

    console.log('Consulta salva no Supabase');
    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Erro na função de léxico:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});