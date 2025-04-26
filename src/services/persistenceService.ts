
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const persistChatMessages = async (
  userId: string,
  slug: string,
  messages: Message[],
  book?: string
) => {
  if (!userId || !slug || messages.length === 0) return;

  try {
    const lastMessage = messages[messages.length - 1]?.content || '';
    const title = messages[0]?.content?.slice(0, 50) + (messages[0]?.content?.length > 50 ? '…' : '');
    
    await supabase
      .from('chat_history')
      .upsert({
        slug,
        user_id: userId,
        title,
        book_slug: book,
        last_message: lastMessage,
        last_accessed: new Date().toISOString(),
        messages: JSON.stringify(messages)
      }, { 
        onConflict: 'slug' 
      });
  } catch (err) {
    console.error('Error persisting messages:', err);
    throw err;
  }
};

export const loadChatMessages = async (slug: string): Promise<Message[] | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('messages')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error loading chat messages:', error);
      return null;
    }

    if (!data?.messages) return null;
    
    // Melhor manipulação dos diferentes formatos de dados possíveis
    if (typeof data.messages === 'string') {
      try {
        const parsed = JSON.parse(data.messages);
        return Array.isArray(parsed) ? parsed.map(convertToMessage) : null;
      } catch (e) {
        console.error('Error parsing JSON messages:', e);
        return null;
      }
    }
    
    if (Array.isArray(data.messages)) {
      return data.messages.map(convertToMessage);
    }
    
    console.error('Unexpected message format in database:', data.messages);
    return null;
  } catch (err) {
    console.error('Error parsing chat messages:', err);
    return null;
  }
};

// Função auxiliar para garantir que os objetos estejam no formato Message
function convertToMessage(item: any): Message {
  if (typeof item === 'object' && item !== null && 'role' in item && 'content' in item) {
    return {
      role: item.role === 'user' || item.role === 'assistant' ? item.role : 'assistant',
      content: typeof item.content === 'string' ? item.content : String(item.content || '')
    };
  }
  
  // Em caso de dados inválidos, retorna uma mensagem padrão
  return { role: 'assistant', content: 'Dados de mensagem inválidos' };
}
