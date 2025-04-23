import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenAI & Assistants API config
const API_KEY = Deno.env.get('OPENAI_API_KEY')!;
// Usar o endpoint v1beta para Assistants API v2
const API_BASE = 'https://api.openai.com/v1beta';
const ASSISTANT_ID = 'asst_YLwvqvZmSOMwxaku53jtKAlt';
const BETA_HEADER = { 'OpenAI-Beta': 'assistants=v2' };
// Instruções opcionais de sistema
const SYSTEM_INSTRUCTIONS = "";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, word } = await req.json();
    if (!word) throw new Error('Parâmetro "word" é obrigatório');

    // 1) Criar thread com mensagens iniciais
    const threadPayload: any = { messages: [{ role: 'user', content: word }] };
    if (SYSTEM_INSTRUCTIONS) {
      threadPayload.messages.unshift({ role: 'system', content: SYSTEM_INSTRUCTIONS });
    }

    const threadRes = await fetch(
      `${API_BASE}/assistants/${ASSISTANT_ID}/threads`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          ...BETA_HEADER
        },
        body: JSON.stringify(threadPayload)
      }
    );
    if (!threadRes.ok) {
      const text = await threadRes.text();
      throw new Error(`Falha ao criar thread: ${text}`);
    }
    const thread = await threadRes.json();
    const threadId = thread.id;
    console.log('Thread criado:', threadId);

    // 2) Disparar run (invocar o Assistente sobre o thread)
    const runRes = await fetch(
      `${API_BASE}/threads/${threadId}/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          ...BETA_HEADER
        },
        body: JSON.stringify({})
      }
    );
    if (!runRes.ok) {
      const text = await runRes.text();
      throw new Error(`Falha ao criar run: ${text}`);
    }
    const run = await runRes.json();
    const runId = run.id;
    console.log('Run iniciado:', runId);

    // 3) Polling até conclusão, tratando tools se houver
    let status = run.status;
    let attempts = 0;
    while (status !== 'completed' && attempts < 60) {
      const statusRes = await fetch(
        `${API_BASE}/threads/${threadId}/runs/${runId}`,
        { headers: { 'Authorization': `Bearer ${API_KEY}`, ...BETA_HEADER } }
      );
      if (!statusRes.ok) {
        const text = await statusRes.text();
        throw new Error(`Erro polling status: ${text}`);
      }
      const st = await statusRes.json();
      status = st.status;

      // Ferramentas (ex: file_system)
      if (st.required_actions) {
        for (const act of st.required_actions) {
          if (act.type === 'tool_call' && act.tool.tool_name === 'file_system') {
            const content = await Deno.readTextFile(act.parameters.path);
            await fetch(
              `${API_BASE}/threads/${threadId}/runs/${runId}/tool-outputs`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${API_KEY}`,
                  'Content-Type': 'application/json',
                  ...BETA_HEADER
                },
                body: JSON.stringify({ tool_outputs: [{ tool_call_id: act.tool_call_id, output: content }] })
              }
            );
          }
        }
      }
      if (['failed','cancelled','expired'].includes(status)) {
        throw new Error(`Run ${status}`);
      }
      await new Promise(r => setTimeout(r, 1000));
      attempts++;
    }
    if (status !== 'completed') {
      throw new Error('Timeout esperando run');
    }

    // 4) Listar mensagens e extrair resposta
    const msgRes = await fetch(
      `${API_BASE}/threads/${threadId}/messages`,
      { headers: { 'Authorization': `Bearer ${API_KEY}`, ...BETA_HEADER } }
    );
    if (!msgRes.ok) {
      const text = await msgRes.text();
      throw new Error(`Falha ao listar mensagens: ${text}`);
    }
    const msgs = await msgRes.json();
    const assistantMsg = msgs.data.find((m: any) => m.role === 'assistant');
    if (!assistantMsg) throw new Error('Nenhuma mensagem do assistente');
    const textObj = assistantMsg.content.find((c: any) => c.type === 'text');
    const reply = textObj?.text?.value;
    if (!reply) throw new Error('Texto da resposta não encontrado');

    // 5) Salvar no Supabase
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { error: insertErr } = await supa
      .from('lexicon_queries')
      .insert({ user_id: userId, word, response: { reply } });
    if (insertErr) {
      console.error('Erro ao inserir no Supabase:', insertErr);
      throw new Error('Falha ao salvar consulta');
    }

    console.log('Consulta salva');
    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('Erro função léxico:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
