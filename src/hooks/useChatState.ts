
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, ChatHistory, ChatProps, ChatState, categorizeChatHistory, TimeframedHistory } from '@/types/chat';
import { useSubscription } from './useSubscription';
import { toast } from './use-toast';
import { loadChatMessages, persistChatMessages } from '@/services/persistenceService';

export const useChatState = (props?: ChatProps): ChatState => {
  const book = props?.book;
  const slug = props?.slug;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const { subscribed } = useSubscription();

  // Função para carregar o histórico de chat
  const loadChatHistory = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('last_accessed', { ascending: false });
      
      if (data && !error) {
        const formattedHistory = data.map(item => ({
          id: item.id,
          title: item.title,
          lastAccessed: new Date(item.last_accessed),
          user_id: item.user_id,
          book_slug: item.book_slug,
          last_message: item.last_message,
          slug: item.slug,
          subscription_required: item.subscription_required
        }));
        setChatHistory(formattedHistory);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  }, [userId]);

  // Função para carregar mensagens específicas do chat
  const fetchMessages = useCallback(async (chatSlug: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const retrievedMessages = await loadChatMessages(chatSlug);
      
      if (retrievedMessages) {
        setMessages(retrievedMessages);
      } else if (subscribed) {
        // Se o usuário é assinante mas não conseguiu carregar, pode ser um problema
        toast({
          title: "Erro",
          description: "Não foi possível carregar as mensagens deste chat.",
          variant: "destructive",
        });
      } else {
        // Se não é assinante e o chat requer assinatura
        const { data } = await supabase
          .from('chat_history')
          .select('subscription_required')
          .eq('slug', chatSlug)
          .single();
          
        if (data?.subscription_required) {
          toast({
            title: "Acesso limitado",
            description: "Este chat contém mais de 50 mensagens. Faça upgrade para o plano premium para acessar o histórico completo.",
            variant: "default",
          });
        }
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar as mensagens.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, subscribed]);

  // Persistir mensagens no Supabase
  const persistMessages = useCallback(async () => {
    if (!userId || !slug || messages.length === 0) return;

    try {
      await persistChatMessages(userId, slug, messages, book);
      // Atualizar o histórico de chat após persistir
      loadChatHistory();
    } catch (err) {
      console.error('Error persisting messages:', err);
    }
  }, [userId, slug, messages, book, loadChatHistory]);

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
  useEffect(() => {
    if (userId) {
      loadChatHistory();
      
      // Se temos slug, carregamos as mensagens específicas
      if (slug) {
        fetchMessages(slug);
      }
    }
  }, [userId, slug, loadChatHistory, fetchMessages]);

  // Persistir mensagens quando elas mudam
  useEffect(() => {
    if (messages.length > 0 && userId && slug) {
      persistMessages();
    }
  }, [messages, userId, slug, persistMessages]);

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
