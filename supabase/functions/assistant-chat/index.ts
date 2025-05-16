
// Função para interagir com os OpenAI Assistants em conversas
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from 'https://esm.sh/openai@4.20.1'
import { corsHeaders } from '../_shared/cors.ts'

const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Inicializa os clientes
const openai = new OpenAI({
  apiKey: openaiApiKey,
})

// Inicializa o cliente Supabase com a service role key
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const sendStreamingResponse = (messages: Message[], threadId: string, runId: string, res: TransformStream) => {
  const writer = res.writable.getWriter();
  const encoder = new TextEncoder();
  
  const poll = async () => {
    try {
      const run = await openai.beta.threads.runs.retrieve(threadId, runId);
      
      if (run.status === "completed") {
        // Busca as mensagens do thread após o run ser completado
        const threadMessages = await openai.beta.threads.messages.list(threadId, {
          order: 'asc',
          limit: 10,
        });
        
        // Encontra a nova mensagem do assistente (deve ser a última)
        const assistantMessages = threadMessages.data.filter(
          (msg) => msg.role === 'assistant' && 
                  msg.run_id === runId
        );
        
        if (assistantMessages.length > 0) {
          const latestMessage = assistantMessages[assistantMessages.length - 1];
          
          // Obtém o conteúdo das mensagens
          const content = latestMessage.content
            .filter((content) => content.type === 'text')
            .map((content) => content.text?.value)
            .join('\n');
          
          // Envia a mensagem do assistente de volta ao cliente
          const messageJson = JSON.stringify({ content });
          await writer.write(encoder.encode(`data: ${messageJson}\n\n`));
        }
        
        // Finaliza o streaming
        await writer.close();
      } else if (run.status === "failed") {
        const errorMessage = JSON.stringify({ 
          error: `Execução falhou: ${run.last_error?.message || 'Erro desconhecido'}`
        });
        await writer.write(encoder.encode(`data: ${errorMessage}\n\n`));
        await writer.close();
      } else if (run.status === "expired" || run.status === "cancelled") {
        const statusMessage = JSON.stringify({ error: `Execução foi ${run.status}` });
        await writer.write(encoder.encode(`data: ${statusMessage}\n\n`));
        await writer.close();
      } else {
        // Continue polling for updates
        setTimeout(poll, 500);
      }
    } catch (err) {
      console.error(`Erro ao buscar atualizações do run: ${err.message}`);
      const errorMessage = JSON.stringify({ error: `Erro ao buscar atualizações: ${err.message}` });
      await writer.write(encoder.encode(`data: ${errorMessage}\n\n`));
      await writer.close();
    }
  };
  
  // Inicia o polling
  poll();
};

Deno.serve(async (req) => {
  // Habilitar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Extrai o token de autorização do cabeçalho
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Verifica a sessão do usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request body
    const { 
      messages,
      bookSlug
    } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages inválidas ou vazias' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    if (!bookSlug) {
      return new Response(JSON.stringify({ error: 'bookSlug é obrigatório' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Busca o prompt com assistant_id para este livro
    const { data: promptData, error: promptError } = await supabase
      .from('bible_prompts')
      .select('assistant_id, prompt_text')
      .eq('book_slug', bookSlug)
      .single();
    
    if (promptError) {
      console.error(`Erro ao buscar prompt para ${bookSlug}: ${promptError.message}`);
      return new Response(JSON.stringify({ error: `Prompt não encontrado para ${bookSlug}` }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Se não tiver assistant_id, retorna flag para usar fluxo normal com prompt_text
    if (!promptData.assistant_id) {
      console.log(`Assistant não encontrado para ${bookSlug}, usando prompt_text`);
      return new Response(JSON.stringify({ 
        usePrompt: true, 
        promptText: promptData.prompt_text 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Determinar o ID do thread a partir da URL ou criar um novo
    const url = new URL(req.url);
    let threadId = url.searchParams.get('threadId');
    let thread;
    
    // Se não tiver thread_id, cria um novo thread
    if (!threadId) {
      console.log(`Criando um novo thread para ${bookSlug}`);
      thread = await openai.beta.threads.create();
      threadId = thread.id;
      console.log(`Novo thread criado: ${threadId}`);
    } else {
      console.log(`Usando thread existente: ${threadId}`);
    }
    
    // Adiciona a mensagem mais recente do usuário ao thread
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'Nenhuma mensagem do usuário encontrada' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    console.log(`Adicionando mensagem ao thread ${threadId}`);
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: lastUserMessage.content
    });
    
    // Inicia o run usando o assistant
    console.log(`Executando assistant ${promptData.assistant_id} no thread ${threadId}`);
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: promptData.assistant_id
    });
    
    // Configura o streaming da resposta
    const stream = new TransformStream();
    const responseInit = {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    };
    
    // Inicia o envio da resposta em streaming
    sendStreamingResponse(messages, threadId, run.id, stream);
    
    return new Response(stream.readable, responseInit);
    
  } catch (e) {
    console.error(`Erro no endpoint assistant-chat: ${e.message}`);
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
