
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const persistChatMessages = async (
  messages: Message[],
  userId: string,
  slug: string,
  book?: string,
) => {
  if (!userId || messages.length === 0) return;

  const lastMessage = messages[messages.length - 1]?.content || '';
  const title = messages[0]?.content?.slice(0, 50) + (messages[0]?.content?.length > 50 ? '…' : '');

  try {
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
      }, { onConflict: 'slug' });
  } catch (err) {
    console.error('Error persisting chat messages:', err);
    throw err;
  }
};

export const loadChatMessages = async (
  slug: string
): Promise<Message[] | null> => {
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
    
    if (typeof data.messages === 'string') {
      return JSON.parse(data.messages) as Message[];
    }
    
    if (Array.isArray(data.messages)) {
      const isValidMessageArray = data.messages.every(
        (item: any): item is Message => 
          typeof item === 'object' && 
          item !== null &&
          'role' in item && 
          'content' in item &&
          (item.role === 'user' || item.role === 'assistant')
      );
      
      if (isValidMessageArray) {
        return data.messages as Message[];
      }
      
      console.error('Invalid message format in database:', data.messages);
      return null;
    }
    
    console.error('Unexpected message format in database:', data.messages);
    return null;
  } catch (err) {
    console.error('Error parsing chat messages:', err);
    return null;
  }
};
