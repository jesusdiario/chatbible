
import { supabase } from '@/integrations/supabase/client';
import { Message, SendMessageResponse } from '@/types/chat';

export const BIBLE_PROMPTS: Record<string, string> = {
  genesis: `Você é um especialista no livro de Gênesis da Bíblia. 
Seu papel é ajudar os usuários a entender este livro, suas histórias, significados e implicações teológicas.
Sempre baseie suas respostas no conteúdo Bíblico e entendimento acadêmico.
Seja conciso, claro e preciso em suas respostas.
Se não tiver certeza sobre algo, admita e sugira verificar com outras fontes.
Mantenha sempre um tom respeitoso e educacional.`,
};

export const sendChatMessage = async (
  content: string,
  messages: Message[],
  book?: string,
  userId?: string,
  slug?: string
): Promise<SendMessageResponse> => {
  const userMessage: Message = { role: "user", content };
  const newMessages = [...messages, userMessage];

  const { data, error } = await supabase.functions.invoke('chat', {
    body: { 
      messages: newMessages,
      systemPrompt: book ? BIBLE_PROMPTS[book] : undefined
    }
  });

  if (error) throw error;

  const assistantMessage: Message = { 
    role: "assistant", 
    content: data.content 
  };

  if (userId) {
    const newSlug = slug || crypto.randomUUID();
    await supabase.from('chat_history').upsert({
      user_id: userId,
      title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
      book_slug: book,
      last_message: assistantMessage.content,
      last_accessed: new Date().toISOString(),
      messages: [...newMessages, assistantMessage],
      slug: newSlug
    });

    return { messages: [...newMessages, assistantMessage], slug: newSlug };
  }

  return { messages: [...newMessages, assistantMessage], slug };
};

export const loadChatMessages = async (chatId: string): Promise<Message[] | null> => {
  const { data } = await supabase
    .from('chat_history')
    .select('messages')
    .eq('id', chatId)
    .single();

  return data?.messages as Message[] | null;
};

