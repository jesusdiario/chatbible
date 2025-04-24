import React, { useEffect } from "react";
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

  // Carrega histórico ao enviar mensagem ou ao entrar em conversa existente
  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      loadChatMessages(slug)
        .then(loaded => {
          if (loaded) setMessages(loaded);
        })
        .catch(() => {
          toast({
            title: "Erro",
            description: "Não foi possível carregar a conversa.",
            variant: "destructive",
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    setIsLoading(true);
    const userMsg: Message = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await sendChatMessage(content, messages, undefined, userId, slug);
      setMessages(result.messages);

      if (!slug) {
        navigate(`/chat/${result.slug}`, { replace: true });
      }

      // Atualiza o histórico do usuário
      if (userId) {
        const { data: updatedHistory } = await supabase
          .from("chat_history")
          .select("id,title,slug,book_slug,last_accessed")
          .eq("user_id", userId)
          .order("last_accessed", { ascending: false });

        if (updatedHistory) {
          setChatHistory(
            updatedHistory.map(h => ({
              id: h.id,
              title: h.title,
              slug: h.slug,
              book_slug: h.book_slug,
              lastAccessed: new Date(h.last_accessed).toLocaleString(),
            }))
          );
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
        { role: "assistant", content: `Erro: ${err.message || "falha"}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSelect = (chatId: string, bookSlug?: string, chatSlug?: string) => {
    if (chatId === "new") {
      setMessages([]);
      navigate("/", { replace: true });
    } else {
      const path = bookSlug
        ? `/livros-da-biblia/${bookSlug}/${chatSlug}`
        : `/chat/${chatSlug}`;
      navigate(path);
      onChatSelect?.(chatId);
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <ErrorBoundary>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onApiKeyChange={() => {}}
          chatHistory={chatHistory}
          onChatSelect={(id) => handleChatSelect(id)}
          currentPath={window.location.pathname}
        />

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-0 md:ml-64" : "ml-0"}`}>
          <ChatHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <div className={`flex h-full flex-col ${messages.length === 0 ? "items-center justify-center" : "justify-between"} pt-[60px] pb-4`}>
            {messages.length === 0 ? (
              <>
                <EmptyChatState
                  title="Nova Conversa"
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />

                {/* Histórico de conversas */}
                <div className="w-full max-w-3xl mx-auto px-4 mt-8">
                  <h1 className="text-2xl font-bold mb-4">Histórico</h1>
                  <ChatHistoryList
                    chatHistory={chatHistory}
                    onChatSelect={(id) => handleChatSelect(id)}
                  />
                </div>
              </>
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
