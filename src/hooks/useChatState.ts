
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, ChatHistory, ChatProps, ChatState } from '@/types/chat';

export const useChatState = ({ book, slug }: ChatProps): ChatState => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    const fetchUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    
    fetchUserSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user ? session.user.id : null);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('last_accessed', { ascending: false });
        
        if (data && !error) {
          const formattedHistory = data.map(item => ({
            id: item.id,
            title: item.title,
            lastAccessed: new Date(item.last_accessed),
            user_id: item.user_id,
            book_slug: item.book_slug,
            last_message: item.last_message,
            slug: item.slug
          }));
          setChatHistory(formattedHistory);
        }
      }
    };
    
    if (userId) {
      loadChatHistory();
    }
  }, [userId]);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId,
    chatHistory,
    setChatHistory
  };
};
