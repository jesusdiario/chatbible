
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
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { loadChatMessages } from '@/services/persistenceService';

const ChatPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const [chatDetails, setChatDetails] = useState<ChatHistoryType | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(true);

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
        
        // Load the messages for this chat
        const chatMessages = await loadChatMessages(slug);
        if (chatMessages) {
          setMessages(chatMessages);
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
  }, [slug, navigate, setMessages]);

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
