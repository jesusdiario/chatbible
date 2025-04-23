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
const BETA_HEADER = {'OpenAI-Beta':'assistants=v2'};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { userId, word } = await req.json();
    if (!word) throw new Error('Parâmetro "word" é obrigatório');

    // 1) Cria run
    const createRes = await fetch(
      `${API_BASE}/assistants/${ASSISTANT_ID}/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          ...BETA_HEADER
        },
        body: JSON.stringify({ instructions: word })
      }
    );
    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(JSON.stringify(err));
    }
    const run = await createRes.json();
    console.log('Run created:', run);
    const threadId = run.thread_id;
    const runId = run.id;

    // 2) Polling status
    let status = run.status;
    let attempts = 0;
    while (status !== 'completed' && attempts < 60) {
      // GET status
      const statRes = await fetch(
        `${API_BASE}/threads/${threadId}/runs/${runId}`,
        { headers: { 'Authorization': `Bearer ${API_KEY}`, ...BETA_HEADER } }
      );
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
                method:'POST',
                headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type':'application/json', ...BETA_HEADER },
                body: JSON.stringify({ tool_outputs: [{ tool_call_id: action.tool_call_id, output: content }] })
              }
            );
          }
        }
      }
      if (statJson.status === 'failed') throw new Error('Run failed');
      if (statJson.status === 'cancelled' || statJson.status === 'expired') throw new Error(`Run ${statJson.status}`);

      await new Promise(r => setTimeout(r, 1000));
      attempts++;  
    }
    if (status !== 'completed') throw new Error('Timeout aguardando run');

    // 3) Lista mensagens
    const msgRes = await fetch(
      `${API_BASE}/threads/${threadId}/messages`,
      { headers: { 'Authorization': `Bearer ${API_KEY}`, ...BETA_HEADER } }
    );
    const msgs = await msgRes.json();
    console.log('Messages:', msgs);
    const assistantMsg = msgs.data.find((m:any) => m.role==='assistant');
    if (!assistantMsg) throw new Error('Nenhuma mensagem do assistente');
    const txt = assistantMsg.content.find((c:any)=>c.type==='text')?.text.value;
    if (!txt) throw new Error('Conteúdo de texto não encontrado');

    // 4) Persiste em Supabase
    const supa = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    await supa.from('lexicon_queries').insert({ user_id:userId, word, response:{reply:txt} });

    return new Response(JSON.stringify({ reply: txt }), { headers:{...corsHeaders,'Content-Type':'application/json'} });
  } catch (e) {
    console.error('Erro:', e);
    return new Response(JSON.stringify({ error: e.message }), { status:500, headers:{...corsHeaders,'Content-Type':'application/json'} });
  }
});