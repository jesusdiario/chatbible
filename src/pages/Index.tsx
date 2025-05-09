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
import { useMessageCount } from '@/hooks/useMessageCount';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Fixed book slug for all chat operations in this screen.
 */
const getDevocionalBookSlug = () => 'devocional-diario';

const ChatPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const [chatDetails, setChatDetails] = useState<ChatHistoryType | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const { subscribed, startCheckout } = useSubscription();
  const [requiresSubscription, setRequiresSubscription] = useState(false);
  const { messageCount, messageLimit, canSendMessage } = useMessageCount();
  const [showLimitDialog, setShowLimitDialog] = useState(false);

  // --- Chat state ----------------------------------------------------------
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId,
  } = useChatState({ slug });

  // --- Chat operations (always for 'devocional-diario') --------------------
  const bookSlug = getDevocionalBookSlug();

  const {
    handleSendMessage,
    isTyping,
  } = useChatOperations(
    bookSlug,
    userId,
    slug,
    messages,
    setMessages,
    setIsLoading,
  );

  // --- Message-limit enforcement ------------------------------------------
  useEffect(() => {
    if (!canSendMessage && !subscribed && messageCount >= messageLimit) {
      setShowLimitDialog(true);
    } else {
      setShowLimitDialog(false);
    }
  }, [canSendMessage, subscribed, messageCount, messageLimit]);

  const handleUpgradeClick = () => {
    startCheckout('price_1RJfFtLyyMwTutR95rlmrvcA');
    setShowLimitDialog(false);
  };

  // --- Fetch chat details --------------------------------------------------
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
            title: 'Chat não encontrado',
            description: 'A conversa que você procura não existe ou foi excluída',
            variant: 'destructive',
          });
          navigate('/history');
          return;
        }

        const formattedChat: ChatHistoryType = {
          id: data.id,
          title: data.title,
          lastAccessed: new Date(data.last_accessed),
          user_id: data.user_id,
          // Force the fixed book slug to keep things consistent
          book_slug: bookSlug,
          last_message: data.last_message,
          slug: data.slug,
          subscription_required: data.subscription_required,
          is_accessible: data.is_accessible,
          is_deleted: data.is_deleted,
          pinned: data.pinned || false,
        };

        setChatDetails(formattedChat);
        setRequiresSubscription(formattedChat.subscription_required || false);

        const chatMessages = await loadChatMessages(slug);
        if (chatMessages) {
          setMessages(chatMessages);
        } else if (formattedChat.subscription_required && !subscribed) {
          setRequiresSubscription(true);
        }
      } catch (err) {
        console.error('Error in fetchChatDetails:', err);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao carregar a conversa',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingChat(false);
      }
    };

    fetchChatDetails();
  }, [slug, navigate, setMessages, subscribed, bookSlug]);

  // --- Loading state -------------------------------------------------------
  if (isLoadingChat) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} currentPath={`/chat/${slug}`} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
          <div className="pt-20 h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </main>
      </div>
    );
  }

  // --- Premium gate --------------------------------------------------------
  if (requiresSubscription && !subscribed) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} currentPath={`/chat/${slug}`} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
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
                <Button variant="ghost" onClick={() => navigate('/history')}>
                  Voltar para o histórico
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Main render ---------------------------------------------------------
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} currentPath={`/chat/${slug}`} />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="h-full">
          <BookChat
            title={chatDetails?.title || 'Chat'}
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping}
            bookSlug={bookSlug}
            onSendMessage={handleSendMessage}
          />
        </div>
      </main>

      {/* Message-limit dialog (non-subscribers only) */}
      {!subscribed && (
        <Dialog open={showLimitDialog} onOpenChange={(open) => !open && setShowLimitDialog(false)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Limite de Mensagens</DialogTitle>
            </DialogHeader>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              <p className="text-lg text-center font-medium mb-6">
                Você atingiu seu limite de {messageLimit} mensagens neste mês.
              </p>
              <Button
                onClick={handleUpgradeClick}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded transition-colors h-auto"
              >
                Fazer upgrade para continuar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ChatPage;