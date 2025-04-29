
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Message, ChatHistory as ChatHistoryType } from '@/types/chat';
import { useChatState } from '@/hooks/useChatState';
import { useChatOperations } from '@/hooks/useChatOperations';
import { loadChatMessages } from '@/services/persistenceService';
import { toast } from '@/components/ui/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

export const useChatPageData = (slug: string | undefined) => {
  const navigate = useNavigate();
  const [chatDetails, setChatDetails] = useState<ChatHistoryType | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const { subscribed, startCheckout } = useSubscription();
  const [requiresSubscription, setRequiresSubscription] = useState(false);

  // Use the chatState hook to manage messages
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId
  } = useChatState({ slug });

  // Use the chatOperations hook for sending messages
  const {
    handleSendMessage,
    isTyping,
    messageProcessingRef,
    lastMessageRef
  } = useChatOperations(
    chatDetails?.book_slug, 
    userId, 
    slug, 
    messages, 
    setMessages, 
    setIsLoading
  );

  // Fetch chat details when the component mounts
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!slug) {
        navigate('/history');
        return;
      }

      try {
        setIsLoadingChat(true);
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('slug', slug)
          .eq('is_deleted', false)
          .single();

        if (error || !data) {
          console.error('Error fetching chat details:', error);
          toast({
            title: "Chat não encontrado",
            description: "A conversa que você procura não existe ou foi excluída",
            variant: "destructive",
          });
          navigate('/history');
          return;
        }

        // Format the chat details
        const formattedChat: ChatHistoryType = {
          id: data.id,
          title: data.title,
          lastAccessed: new Date(data.last_accessed),
          user_id: data.user_id,
          book_slug: data.book_slug,
          last_message: data.last_message,
          slug: data.slug,
          subscription_required: data.subscription_required,
          is_accessible: data.is_accessible,
          is_deleted: data.is_deleted,
          pinned: data.pinned || false
        };

        setChatDetails(formattedChat);
        setRequiresSubscription(formattedChat.subscription_required || false);
        
        // Load the messages for this chat
        const chatMessages = await loadChatMessages(slug);
        if (chatMessages) {
          setMessages(chatMessages);
        } else if (formattedChat.subscription_required && !subscribed) {
          // If no messages were loaded and chat requires subscription
          setRequiresSubscription(true);
        }
      } catch (err) {
        console.error('Error in fetchChatDetails:', err);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar a conversa",
          variant: "destructive",
        });
      } finally {
        setIsLoadingChat(false);
      }
    };

    fetchChatDetails();
  }, [slug, navigate, setMessages, subscribed]);

  return {
    chatDetails,
    isLoadingChat,
    requiresSubscription,
    subscribed,
    messages,
    isLoading,
    isTyping,
    handleSendMessage,
    startCheckout
  };
};
