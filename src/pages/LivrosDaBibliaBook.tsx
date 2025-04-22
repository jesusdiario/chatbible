
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import ErrorBoundary from "@/components/ErrorBoundary";
import BookLoadingState from "@/components/BookLoadingState";
import BookErrorState from "@/components/BookErrorState";
import BookChat from "@/components/BookChat";
import { useBibleBook } from "@/hooks/useBibleBook";
import { useChatState } from "@/hooks/useChatState";
import { sendChatMessage, loadChatMessages } from "@/services/chatService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";

const LivrosDaBibliaBook = () => {
  const { book, slug } = useParams<{ book?: string, slug?: string }>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  
  const { bookDetails, loadingBook } = useBibleBook(book);
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId,
    chatHistory,
    setChatHistory
  } = useChatState({ book, slug });

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
    return <BookLoadingState 
      isSidebarOpen={isSidebarOpen} 
      onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
    />;
  }

  if (!bookDetails) {
    return <BookErrorState 
      isSidebarOpen={isSidebarOpen} 
      onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
    />;
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
          <BookChat
            title={bookDetails.title}
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping}
            bookSlug={book}
            onSendMessage={handleSendMessage}
          />
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default LivrosDaBibliaBook;
