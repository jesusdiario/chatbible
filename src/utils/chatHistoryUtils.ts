
import { ChatHistory, TimeframedHistory } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';

/**
 * Loads the chat history from Supabase for a specific user
 */
export const fetchChatHistory = async (userId: string | null): Promise<ChatHistory[]> => {
  if (!userId) return [];
  
  try {
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

/**
 * Categorize chat history by timeframe
 */
export const categorizeChatHistory = (chats: ChatHistory[]): TimeframedHistory[] => {
  if (!chats || chats.length === 0) {
    return [];
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // First sort by pinned status, then by date
  const sortedChats = [...chats].sort((a, b) => {
    // If one is pinned and the other is not, pinned comes first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    // If both are either pinned or not pinned, sort by date
    return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
  });

  const today: ChatHistory[] = [];
  const yesterdayChats: ChatHistory[] = [];
  const lastSevenDays: ChatHistory[] = [];
  const lastThirtyDays: ChatHistory[] = [];
  const older: ChatHistory[] = [];

  sortedChats.forEach(chat => {
    const chatDate = new Date(chat.lastAccessed);
    
    if (chatDate.toDateString() === now.toDateString()) {
      today.push(chat);
    } else if (chatDate.toDateString() === yesterday.toDateString()) {
      yesterdayChats.push(chat);
    } else if (chatDate >= sevenDaysAgo) {
      lastSevenDays.push(chat);
    } else if (chatDate >= thirtyDaysAgo) {
      lastThirtyDays.push(chat);
    } else {
      older.push(chat);
    }
  });

  const timeframes: TimeframedHistory[] = [];

  if (today.length > 0) {
    timeframes.push({
      title: "Hoje",
      items: today
    });
  }

  if (yesterdayChats.length > 0) {
    timeframes.push({
      title: "Ontem",
      items: yesterdayChats
    });
  }

  if (lastSevenDays.length > 0) {
    timeframes.push({
      title: "Últimos 7 Dias",
      items: lastSevenDays
    });
  }

  if (lastThirtyDays.length > 0) {
    timeframes.push({
      title: "Últimos 30 Dias",
      items: lastThirtyDays
    });
  }

  if (older.length > 0) {
    timeframes.push({
      title: "Mais Antigos",
      items: older
    });
  }

  return timeframes;
};
