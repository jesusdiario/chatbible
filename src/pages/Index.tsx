import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import EmptyChatState from "@/components/EmptyChatState";
import ChatHistoryList from "@/components/ChatHistoryList";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useChatState } from "@/hooks/useChatState";
import { sendChatMessage, loadChatMessages } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";  // Tipo Message para tipar as mensagens

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId,
    chatHistory,
    setChatHistory
  } = useChatState({ slug });

  React.useEffect(() => {
    const loadExistingChat = async () => {
      if (slug) {
        setIsLoading(true);
        try {
          const loadedMessages = await loadChatMessages(slug);
          if (loadedMessages) {
            setMessages(loadedMessages);
          }
        } catch (error) {
          toast({
            title: "Erro",
            description: "Erro ao carregar o histórico da conversa",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExistingChat();
  }, [slug, setMessages, setIsLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    const userMessage: Message = { role: "user", content };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await sendChatMessage(content, messages, undefined, userId, slug);
      setMessages(result.messages);

      if (!slug) {
        navigate(`/chat/${result.slug}`);
      }

      if (userId) {
        const { data: updatedHistory } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('last_accessed', { ascending: false });

        if (updatedHistory) {
          const formattedHistory = updatedHistory.map(item => ({
            id: item.id,
            title: item.title,
            lastAccessed: new Date(item.last_accessed),
            lastMessage: item.last_message,
            slug: item.slug,
          }));
          setChatHistory(formattedHistory);
        }
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message || "Erro inesperado ao enviar mensagem",
        variant: "destructive",
      });
      const errorMessage: Message = {
        role: "assistant",
        content: "Ocorreu um erro: " + (err?.message || "Erro inesperado")
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = async (chatSlug: string) => {
    if (chatSlug === 'new') {
      setMessages([]);
      navigate('/');
      return;
    }

    try {
      const msgs = await loadChatMessages(chatSlug);
      if (msgs) setMessages(msgs);
      navigate(`/chat/${chatSlug}`);
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao carregar o histórico da conversa",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <ErrorBoundary>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onApiKeyChange={() => {}}
          chatHistory={chatHistory}
          onChatSelect={handleChatSelect}
          currentPath={window.location.pathname}
        />

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
            {messages.length === 0 ? (
              <>
                <EmptyChatState
                  title="Nova Conversa"
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />

                {/* Histórico */}
                <div className="w-full max-w-3xl mx-auto px-4 mt-8">
                  <h1 className="text-2xl font-bold mb-4">Histórico</h1>
                  <ChatHistoryList
                    chatHistory={chatHistory}
                    onChatSelect={handleChatSelect}
                  />
                </div>
              </>
            ) : (
              <>
                {isLoading && <LoadingSpinner />}
                <MessageList messages={messages} />
                <div className="w-full max-w-3xl mx-auto px-4 py-2">
                  <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                </div>
              </>
            )}
          </div>
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default Index;