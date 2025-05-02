
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
    // Get the first message (user's initial query)
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
    
    // Generate a better title - up to 50 chars from first user message
    let title = firstUserMessage.slice(0, 50) + (firstUserMessage.length > 50 ? '…' : '');
    
    // Use the latest message for the last_message field
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Verificar se o número de mensagens é maior que 50
    const subscription_required = messages.length > 50;
    const stored_messages = subscription_required ? messages.slice(-50) : messages;
    
    await supabase
      .from('chat_history')
      .upsert({
        slug,
        user_id: userId,
        title,
        book_slug: book,
        last_message: lastMessage,
        last_accessed: new Date().toISOString(),
        messages: JSON.stringify(stored_messages),
        subscription_required,
        is_accessible: true,
        is_deleted: false
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
      .select('messages, subscription_required')
      .eq('slug', slug)
      .eq('is_deleted', false)
      .single();

    if (error) {
      console.error('Error loading chat messages:', error);
      return null;
    }

    if (!data?.messages) return null;
    
    // Verificar se é necessário verificar assinatura
    if (data.subscription_required) {
      // Verificar se o usuário tem assinatura
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      
      const { data: subscriberData } = await supabase
        .from('subscribers')
        .select('subscribed')
        .eq('user_id', session.user.id)
        .single();
      
      // Se não for assinante, retornar apenas as últimas 50 mensagens
      if (!subscriberData?.subscribed) {
        const messages = parseMessages(data.messages);
        return messages ? messages.slice(-50) : null;
      }
    }
    
    return parseMessages(data.messages);
  } catch (err) {
    console.error('Error parsing chat messages:', err);
    return null;
  }
};

export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chat_history')
      .update({ is_deleted: true })
      .eq('id', chatId);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting chat:', err);
    return false;
  }
};

export const updateChatTitle = async (slug: string, title: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chat_history')
      .update({ title })
      .eq('slug', slug);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error updating chat title:', err);
    return false;
  }
};

export const toggleChatPin = async (slug: string, pinned: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('chat_history')
      .update({ pinned })
      .eq('slug', slug);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error toggling chat pin status:', err);
    return false;
  }
};

// Function to generate a title for a chat based on content
export const generateChatTitle = async (
  messages: Message[],
  defaultTitle: string = "Nova Conversa"
): Promise<string> => {
  if (!messages || messages.length === 0) {
    return defaultTitle;
  }
  
  // Get the first user message
  const firstUserMessage = messages.find(m => m.role === 'user')?.content;
  
  if (!firstUserMessage) {
    return defaultTitle;
  }
  
  // Simple title generation - take the first 50 chars
  return firstUserMessage.slice(0, 50) + (firstUserMessage.length > 50 ? '…' : '');
};

// Função auxiliar para processar mensagens
function parseMessages(messagesData: any): Message[] | null {
  if (typeof messagesData === 'string') {
    try {
      const parsed = JSON.parse(messagesData);
      return Array.isArray(parsed) ? parsed.map(convertToMessage) : null;
    } catch (e) {
      console.error('Error parsing JSON messages:', e);
      return null;
    }
  }
  
  if (Array.isArray(messagesData)) {
    return messagesData.map(convertToMessage);
  }
  
  console.error('Unexpected message format in database:', messagesData);
  return null;
}

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
