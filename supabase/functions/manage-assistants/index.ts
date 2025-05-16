
// Função para gerenciar os OpenAI Assistants
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

Deno.serve(async (req) => {
  // Tratamento do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Extrai o token de autorização do cabeçalho
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Verifica a sessão do usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Verifica se o usuário tem papel de admin
    const { data: hasAdminRole } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    })
    
    if (!hasAdminRole) {
      return new Response(JSON.stringify({ error: 'Acesso negado: permissão de administrador necessária' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
    
    // Processa os diferentes endpoints
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    if (req.method === 'POST') {
      const body = await req.json()
      
      switch (action) {
        case 'create': {
          const { bookSlug, promptText } = body
          if (!bookSlug || !promptText) {
            return new Response(JSON.stringify({ error: 'bookSlug e promptText são obrigatórios' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          console.log(`Criando assistant para book_slug: ${bookSlug}`)
          
          // Cria um novo Assistant na OpenAI
          const assistant = await openai.beta.assistants.create({
            name: `Bíblia: ${bookSlug}`,
            instructions: promptText,
            model: "gpt-4o",
            tools: [{ type: "retrieval" }]
          })
          
          console.log(`Assistant criado com ID: ${assistant.id}`)
          
          // Atualiza o registro no banco de dados
          const { error: updateError } = await supabase
            .from('bible_prompts')
            .update({ assistant_id: assistant.id })
            .eq('book_slug', bookSlug)
          
          if (updateError) {
            console.error(`Erro ao atualizar bible_prompts: ${updateError.message}`)
            return new Response(JSON.stringify({ error: `Erro ao atualizar o banco de dados: ${updateError.message}` }), { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            assistant: {
              id: assistant.id,
              name: assistant.name,
              bookSlug
            }
          }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          })
        }
        
        case 'update': {
          const { bookSlug, assistantId, promptText } = body
          if (!bookSlug || !assistantId || !promptText) {
            return new Response(JSON.stringify({ error: 'bookSlug, assistantId e promptText são obrigatórios' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          console.log(`Atualizando assistant ${assistantId} para book_slug: ${bookSlug}`)
          
          // Atualiza o Assistant existente
          const assistant = await openai.beta.assistants.update(
            assistantId,
            {
              instructions: promptText,
              model: "gpt-4o"
            }
          )
          
          console.log(`Assistant ${assistant.id} atualizado`)
          
          return new Response(JSON.stringify({ 
            success: true, 
            assistant: {
              id: assistant.id,
              name: assistant.name,
              bookSlug
            }
          }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          })
        }
        
        case 'delete': {
          const { assistantId, bookSlug } = body
          if (!assistantId || !bookSlug) {
            return new Response(JSON.stringify({ error: 'assistantId e bookSlug são obrigatórios' }), { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          console.log(`Excluindo assistant ${assistantId} do book_slug: ${bookSlug}`)
          
          // Exclui o assistant da OpenAI
          await openai.beta.assistants.del(assistantId)
          
          // Atualiza o registro no banco de dados
          const { error: updateError } = await supabase
            .from('bible_prompts')
            .update({ assistant_id: null })
            .eq('book_slug', bookSlug)
          
          if (updateError) {
            console.error(`Erro ao atualizar bible_prompts: ${updateError.message}`)
            return new Response(JSON.stringify({ error: `Erro ao atualizar o banco de dados: ${updateError.message}` }), { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          return new Response(JSON.stringify({ 
            success: true
          }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          })
        }
        
        case 'migrate-all': {
          console.log("Iniciando migração de todos os prompts para Assistants")
          
          // Busca todos os prompts que não têm assistant_id
          const { data: prompts, error: promptsError } = await supabase
            .from('bible_prompts')
            .select('book_slug, prompt_text')
            .is('assistant_id', null)
          
          if (promptsError) {
            console.error(`Erro ao buscar prompts: ${promptsError.message}`)
            return new Response(JSON.stringify({ error: `Erro ao buscar prompts: ${promptsError.message}` }), { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          const results = []
          
          // Cria um assistant para cada prompt
          for (const prompt of prompts) {
            try {
              console.log(`Criando assistant para book_slug: ${prompt.book_slug}`)
              
              // Cria um novo Assistant na OpenAI
              const assistant = await openai.beta.assistants.create({
                name: `Bíblia: ${prompt.book_slug}`,
                instructions: prompt.prompt_text,
                model: "gpt-4o",
                tools: [{ type: "retrieval" }]
              })
              
              console.log(`Assistant criado com ID: ${assistant.id}`)
              
              // Atualiza o registro no banco de dados
              const { error: updateError } = await supabase
                .from('bible_prompts')
                .update({ assistant_id: assistant.id })
                .eq('book_slug', prompt.book_slug)
              
              if (updateError) {
                console.error(`Erro ao atualizar bible_prompts para ${prompt.book_slug}: ${updateError.message}`)
                results.push({ 
                  bookSlug: prompt.book_slug, 
                  success: false, 
                  error: updateError.message 
                })
              } else {
                results.push({ 
                  bookSlug: prompt.book_slug, 
                  success: true, 
                  assistantId: assistant.id 
                })
              }
            } catch (err) {
              console.error(`Erro ao criar assistant para ${prompt.book_slug}: ${err.message}`)
              results.push({ 
                bookSlug: prompt.book_slug, 
                success: false, 
                error: err.message 
              })
            }
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            results
          }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          })
        }
        
        default:
          return new Response(JSON.stringify({ error: 'Ação inválida' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
      }
    } else if (req.method === 'GET') {
      switch (action) {
        case 'list': {
          const bookSlug = url.searchParams.get('bookSlug')
          
          let query = supabase
            .from('bible_prompts')
            .select('*')
          
          if (bookSlug) {
            query = query.eq('book_slug', bookSlug)
          }
          
          const { data: prompts, error: promptsError } = await query
          
          if (promptsError) {
            return new Response(JSON.stringify({ error: `Erro ao buscar prompts: ${promptsError.message}` }), { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }
          
          return new Response(JSON.stringify({ 
            success: true, 
            prompts
          }), { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          })
        }
        
        default:
          return new Response(JSON.stringify({ error: 'Ação inválida' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
      }
    }
    
    return new Response(JSON.stringify({ error: 'Método não suportado' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (e) {
    console.error(`Erro no endpoint manage-assistants: ${e.message}`)
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
