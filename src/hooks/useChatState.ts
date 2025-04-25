
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, ChatHistory, ChatProps, ChatState, categorizeChatHistory, TimeframedHistory } from '@/types/chat';

export const useChatState = (props?: ChatProps): ChatState => {
  const book = props?.book;
  const slug = props?.slug;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  // Função para carregar mensagens específicas do chat
  const loadMessages = async (chatSlug: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('slug', chatSlug)
        .eq('user_id', userId)
        .single();
      
      if (data && !error && data.messages) {
        const parsedMessages = typeof data.messages === 'string' 
          ? JSON.parse(data.messages) 
          : data.messages;
          
        setMessages(parsedMessages);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para persistir mensagens no Supabase
  const persistMessages = async () => {
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

      // Atualizamos o histórico de chat após persistir
      loadChatHistory();
    } catch (err) {
      console.error('Error persisting messages:', err);
    }
  };
  
  // Carregar usuário e configurar listener
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

  // Carregar histórico de chat quando userId muda
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

  useEffect(() => {
    if (userId) {
      loadChatHistory();
      
      // Se temos slug, carregamos as mensagens específicas
      if (slug) {
        loadMessages(slug);
      }
    }
  }, [userId, slug]);

  // Persistir mensagens quando elas mudam
  useEffect(() => {
    if (messages.length > 0 && userId && slug) {
      persistMessages();
    }
  }, [messages, userId, slug]);

  // Versão modificada do setMessages que garante persistência
  const setMessagesSafe = (messagesOrUpdater: React.SetStateAction<Message[]>) => {
    setMessages(messagesOrUpdater);
  };

  return {
    messages,
    setMessages: setMessagesSafe,
    isLoading,
    setIsLoading,
    userId,
    chatHistory,
    setChatHistory
  };
};
