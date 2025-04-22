import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import EmptyChatState from "@/components/EmptyChatState";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useChatState } from "@/hooks/useChatState";
import { sendChatMessage, loadChatMessages } from "@/services/chatService";
import { getBibleBookBySlug } from "@/services/bibleService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";

const LivrosDaBibliaBook = () => {
  const { book, slug } = useParams<{ book?: string, slug?: string }>();
  const [bookDetails, setBookDetails] = useState<{ title: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [loadingBook, setLoadingBook] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId,
    chatHistory,
    setChatHistory
  } = useChatState({ book, slug });

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!book) return;
      
      try {
        setLoadingBook(true);
        const bookData = await getBibleBookBySlug(book);
        if (bookData) {
          setBookDetails(bookData);
        } else {
          console.error("Book not found:", book);
        }
      } catch (error) {
        console.error("Error fetching book details:", error);
      } finally {
        setLoadingBook(false);
      }
    };

    fetchBookDetails();
  }, [book]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    const userMessage: Message = { role: "user", content };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      setIsTyping(true);
      
      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages(prevMsgs => [...prevMsgs, assistantMessage]);
      
      const result = await sendChatMessage(content, messages.slice(0, -1), book, userId || undefined, slug);
      
      setMessages(prevMsgs => {
        const newMsgs = [...prevMsgs];
        newMsgs[newMsgs.length - 1] = { 
          role: "assistant", 
          content: result.messages[result.messages.length - 1].content 
        };
        return newMsgs;
      });
      
      if (!slug && book) {
        navigate(`/livros-da-biblia/${book}/${result.slug}`);
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
            user_id: item.user_id,
            book_slug: item.book_slug,
            last_message: item.last_message,
            slug: item.slug
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
      setMessages(prevMsgs => {
        const newMsgs = [...prevMsgs];
        newMsgs[newMsgs.length - 1] = { 
          role: "assistant", 
          content: "Ocorreu um erro: " + (err?.message || "Erro inesperado") 
        };
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleChatSelect = async (chatId: string) => {
    if (chatId === 'new') {
      setMessages([]);
      return;
    }

    try {
      const messages = await loadChatMessages(chatId);
      if (messages) {
        setMessages(messages);
      }
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar o histórico da conversa",
        variant: "destructive",
      });
    }
  };

  if (loadingBook) {
    return (
      <div className="flex h-screen flex-col">
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
            <div className="pt-[60px] flex items-center justify-center min-h-[70vh]">
              <LoadingSpinner />
            </div>
          </main>
        </ErrorBoundary>
      </div>
    );
  }

  if (!bookDetails) {
    return (
      <div className="flex h-screen flex-col">
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
            <div className="pt-[60px] flex items-center justify-center min-h-[70vh] text-lg px-4">
              Livro não encontrado.
            </div>
          </main>
        </ErrorBoundary>
      </div>
    );
  }

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
              <EmptyChatState
                title={bookDetails.title}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                bookSlug={book}
              />
            ) : (
              <>
                <MessageList messages={messages} isTyping={isTyping} />
                <div className="w-full max-w-3xl mx-auto px-4 py-2">
                  <ChatInput 
                    onSend={handleSendMessage} 
                    isLoading={isLoading} 
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default LivrosDaBibliaBook;
