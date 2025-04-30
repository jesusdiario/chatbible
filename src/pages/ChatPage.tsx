
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Message, ChatHistory as ChatHistoryType } from '@/types/chat';
import { useChatState } from '@/hooks/useChatState';
import { useChatOperations } from '@/hooks/useChatOperations';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import BookChat from '@/components/BookChat';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import { Loader2, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { loadChatMessages } from '@/services/persistenceService';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';

const ChatPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
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

  const handleUpgradeClick = () => {
    startCheckout('price_1OeVptLyyMwTutR9oFF1m3aC'); // Use your premium plan price ID
  };

  if (isLoadingChat) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar}
          currentPath={`/chat/${slug}`}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen} 
            onToggleSidebar={toggleSidebar} 
          />
          <div className="pt-20 h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    );
  }

  // Show subscription required view
  if (requiresSubscription && !subscribed) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar}
          currentPath={`/chat/${slug}`}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen} 
            onToggleSidebar={toggleSidebar} 
            title={chatDetails?.title || "Conversa"}
          />
          <div className="pt-20 h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="mb-4 p-3 rounded-full bg-amber-100 inline-flex">
                <Lock className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Conteúdo Premium</h2>
              <p className="text-gray-600 mb-6">
                Esta conversa contém mais de 50 mensagens e só está disponível para assinantes do plano Premium.
              </p>
              <Button onClick={handleUpgradeClick} className="w-full">
                Fazer upgrade para Premium
              </Button>
              <div className="mt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/history')}
                >
                  Voltar para o histórico
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        currentPath={`/chat/${slug}`}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={toggleSidebar} 
          title={chatDetails?.title}
        />
        <div className="h-full">
          <BookChat
            title={chatDetails?.title || "Chat"}
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping}
            bookSlug={chatDetails?.book_slug}
            onSendMessage={handleSendMessage}
          />
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
