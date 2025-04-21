import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import ActionButtons, { ChatContext } from "@/components/ActionButtons";
import MessageList from "@/components/MessageList";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const LivrosDaBibliaBook = () => {
  const { book } = useParams<{ book?: string }>();
  const config = book ? bibleAssistants[book] : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Only handle custom interface for "genesis"
  if (book === "genesis" && config) {
    const handleSendMessage = async (content: string) => {
      if (!content.trim()) return;
      
      setIsLoading(true);
      try {
        const userMessage: Message = { role: "user", content };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        const { data, error } = await supabase.functions.invoke('genesis-chat', {
          body: { messages: newMessages }
        });

        if (error) throw error;

        const assistantContent = data.choices[0].message.content;
        const assistantMessage: Message = { 
          role: "assistant", 
          content: assistantContent 
        };
        
        setMessages([...newMessages, assistantMessage]);
      } catch (err: any) {
        const errorMessage: Message = { 
          role: "assistant", 
          content: "Ocorreu um erro: " + (err?.message || "Erro inesperado") 
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          chatHistory={[]} 
          onApiKeyChange={() => {}}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen}
          />
          <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
            {messages.length === 0 ? (
              <div className="w-full max-w-3xl px-4 space-y-4">
                <div>
                  <h1 className="mb-8 text-4xl font-semibold text-center">
                    Converse sobre {config.title}
                  </h1>
                  <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                </div>
                <ChatContext.Provider value={{ sendMessage: handleSendMessage }}>
                  <ActionButtons />
                </ChatContext.Provider>
              </div>
            ) : (
              <>
                <MessageList messages={messages} />
                <div className="w-full max-w-3xl mx-auto px-4 py-2">
                  <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Default/fallback for all other books or missing
  if (!config) {
    return (
      <div className="flex h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          onApiKeyChange={() => {}}
          chatHistory={[]}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen} 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="pt-[60px] flex items-center justify-center min-h-[70vh] text-lg">
            Livro não encontrado.
          </div>
        </main>
      </div>
    );
  }

  // Fallback UI for other books (not Genesis)
  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={() => {}}
        chatHistory={[]}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="pt-[60px] p-6">
          <h1 className="text-3xl font-bold mb-4">
            Converse com {config.title}
          </h1>
          <div className="rounded shadow text-lg bg-slate-900/60 p-6">
            (Chat dedicado para {config.title} em breve!)
          </div>
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBibliaBook;
