
import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/chat';
import { loadChatMessages, persistChatMessages } from '@/services/persistenceService';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

/**
 * Hook to manage chat messages for a specific chat
 */
export const useChatMessages = (
  userId: string | null,
  slug?: string,
  book?: string
) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { subscribed } = useSubscription();

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
        const { supabase } = await import('@/integrations/supabase/client');
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
    } catch (err) {
      console.error('Error persisting messages:', err);
    }
  }, [userId, slug, messages, book]);

  // Load messages when slug changes
  useEffect(() => {
    if (userId && slug) {
      fetchMessages(slug);
    }
  }, [userId, slug, fetchMessages]);

  // Persist messages when they change
  useEffect(() => {
    if (messages.length > 0 && userId && slug) {
      persistMessages();
    }
  }, [messages, userId, slug, persistMessages]);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading
  };
};
