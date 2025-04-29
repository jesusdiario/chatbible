
import { ChatHistory, TimeframedHistory } from '@/types/chat';

/**
 * Loads the chat history from Supabase for a specific user
 */
export const fetchChatHistory = async (userId: string | null): Promise<ChatHistory[]> => {
  if (!userId) return [];
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('last_accessed', { ascending: false });
    
    if (data && !error) {
      return data.map(item => ({
        id: item.id,
        title: item.title,
        lastAccessed: new Date(item.last_accessed),
        user_id: item.user_id,
        book_slug: item.book_slug,
        last_message: item.last_message,
        slug: item.slug,
        subscription_required: item.subscription_required,
        is_accessible: item.is_accessible,
        is_deleted: item.is_deleted,
        pinned: item.pinned || false
      }));
    }
  } catch (err) {
    console.error('Error loading chat history:', err);
  }
  
  return [];
};
