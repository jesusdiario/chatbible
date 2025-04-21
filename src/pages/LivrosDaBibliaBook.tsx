
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import LoadingState from "@/components/LoadingState";
import BookNotFound from "@/components/BookNotFound";
import ChatInterface from "@/components/ChatInterface";
import { useChat } from "@/hooks/useChat";
import { ChatHistory } from "@/types/chat";

interface ChatData {
  id: string;
  title: string;
  messages: any[];
  lastAccessed: Date;
}

const LivrosDaBibliaBook = () => {
  const { book } = useParams<{ book?: string }>();
  const [bookConfig, setBookConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [chatsData, setChatsData] = useState<Record<string, ChatData>>({});

  const {
    messages,
    isLoading: isChatLoading,
    startNewChat,
    loadChat,
    sendMessage
  } = useChat(apiKey);

  useEffect(() => {
    const fetchBookConfig = async () => {
      if (!book) return;
      
      try {
        const { data, error } = await supabase
          .from('bible_assistants')
          .select('*')
          .eq('slug', book)
          .single();

        if (error) throw error;
        setBookConfig(data);
      } catch (error: any) {
        console.error('Error fetching book config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookConfig();
  }, [book]);

  useEffect(() => {
    if (book !== "genesis") return;
    const savedHistory = localStorage.getItem('genesis_chatHistory');
    const savedChatsData = localStorage.getItem('genesis_chatsData');
    
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory, (key, value) => {
        if (key === 'lastAccessed') return new Date(value);
        return value;
      }));
    }
    
    if (savedChatsData) {
      setChatsData(JSON.parse(savedChatsData, (key, value) => {
        if (key === 'lastAccessed') return new Date(value);
        return value;
      }));
    }
  }, [book]);

  useEffect(() => {
    if (book !== "genesis") return;
    if (chatHistory.length > 0) {
      localStorage.setItem('genesis_chatHistory', JSON.stringify(chatHistory));
    }
    if (Object.keys(chatsData).length > 0) {
      localStorage.setItem('genesis_chatsData', JSON.stringify(chatsData));
    }
  }, [chatHistory, chatsData, book]);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  const handleChatSelect = (chatId: string) => {
    const chatData = chatsData[chatId];
    if (chatData) {
      loadChat(chatId, chatData);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  if (isLoading) {
    return (
      <LoadingState 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={handleApiKeyChange}
      />
    );
  }

  if (!bookConfig) {
    return (
      <BookNotFound 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={handleApiKeyChange}
      />
    );
  }

  if (book === "genesis") {
    return (
      <div className="flex h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          onApiKeyChange={handleApiKeyChange}
          onChatSelect={handleChatSelect}
          chatHistory={chatHistory}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen} 
            onNewChat={startNewChat}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <ChatInterface 
            messages={messages}
            isLoading={isChatLoading}
            onSendMessage={(content) => sendMessage(content, chatsData, setChatsData, setChatHistory)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={handleApiKeyChange}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="pt-[60px] p-6">
          <h1 className="text-3xl font-bold mb-4">
            Converse com {bookConfig.title}
          </h1>
          <div className="rounded shadow text-lg bg-slate-900/60 p-6">
            (Chat dedicado para {bookConfig.title} em breve!)
          </div>
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBibliaBook;
