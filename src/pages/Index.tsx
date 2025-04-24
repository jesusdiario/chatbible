// src/pages/Index.tsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import EmptyChatState from "@/components/EmptyChatState";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import ChatHistoryList from "@/components/ChatHistoryList";
import { useChatState } from "@/hooks/useChatState";
import { sendChatMessage, loadChatMessages } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";
import { categorizeChatHistory } from "@/types/chat";

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
      if (!slug) return;
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
        navigate(`/chat/${result.slug}`, { replace: true });
      }

      if (userId) {
        const { data: updatedHistory } = await supabase
          .from("chat_history")
          .select("id, slug, title, book_slug, last_message, last_accessed")
          .eq("user_id", userId)
          .order("last_accessed", { ascending: false });

        if (updatedHistory) {
          const formatted = updatedHistory.map(item => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            bookSlug: item.book_slug,
            lastMessage: item.last_message,
            lastAccessed: new Date(item.last_accessed).toLocaleString(),
          }));
          setChatHistory(formatted);
        }
      }
    } catch (err: any) {
      toast({
        title: "Erro ao enviar",
        description: err.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: `Erro: ${err.message || "falha ao enviar"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    if (chatId === 'new') {
      setMessages([]);
      navigate("/", { replace: true });
      return;
    }
    try {
      const msgs = await loadChatMessages(chatId);
      if (msgs) setMessages(msgs);
      navigate(`/chat/${chatId}`);
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao carregar o histórico da conversa",
        variant: "destructive",
      });
    }
  };

  const categorizedHistory = React.useMemo(
    () => categorizeChatHistory(chatHistory),
    [chatHistory]
  );

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

        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-0 md:ml-64" : "ml-0"
          }`}
        >
          <ChatHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Espaçamento ajustado para 16 (64px) */}
          <div
            className={`flex h-full flex-col ${
              messages.length === 0
                ? "items-center justify-center"
                : "justify-between"
            } pt-16 pb-4`}
          >
            {messages.length === 0 ? (
              <div className="w-full space-y-8">
                <EmptyChatState
                  title="Nova Conversa"
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
                {chatHistory.length > 0 && (
                  <div className="px-4">
                    <h1 className="text-2xl font-bold mb-4">Histórico</h1>
                    <ChatHistoryList
                      chatHistory={categorizedHistory}
                      onChatSelect={handleChatSelect}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                )}
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