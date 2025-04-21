
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import ActionButtons, { ChatContext } from "@/components/ActionButtons";
import MessageList from "@/components/MessageList";
import { ChatHistory } from "@/types/chat";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ChatData {
  id: string;
  title: string;
  messages: Message[];
  lastAccessed: Date;
}

const genesisOpenAIAssistantId = "asst_YLwvqvZmSOMwxaku53jtKAlt";
const genesisOpenAIKey = "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";

const LivrosDaBibliaBook = () => {
  const { book } = useParams<{ book?: string }>();
  const config = book ? bibleAssistants[book] : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('openai_api_key') || '');

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  // Only handle custom interface for "genesis"
  if (book === "genesis" && config) {
    // Minimal chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Only handle client chat in memory for this assistant.
    const handleSendMessage = async (content: string) => {
      if (!content.trim()) return;
      setIsLoading(true);
      try {
        const userMessage: Message = { role: "user", content };
        const newMessages: Message[] = [...messages, userMessage];
        setMessages(newMessages);

        const response = await fetch('https://api.openai.com/v2/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${genesisOpenAIKey}`,
            'OpenAI-Beta': 'assistants=v1'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: newMessages.map(msg => ({ 
              role: msg.role, 
              content: msg.content 
            })),
            max_tokens: 1024
          })
        });

        if (!response.ok) {
          let resp = await response.json().catch(() => ({}));
          throw new Error(resp.error?.message || "Erro ao comunicar com a OpenAI");
        }

        const data = await response.json();
        const assistantContent = data?.choices?.[0]?.message?.content;

        const assistantMessage: Message = { role: "assistant", content: assistantContent };
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
          onApiKeyChange={handleApiKeyChange}
          chatHistory={[]}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen}
            // Hide new chat button for this custom assistant
          />
          <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
            {messages.length === 0 ? (
              <div className="w-full max-w-3xl px-4 space-y-4">
                <div>
                  <h1 className="mb-8 text-4xl font-semibold text-center">
                    Converse com {config.title}
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
                <div className="text-xs text-center text-gray-500 py-2">
                  O BibleGPT pode cometer erros. Verifique informações importantes.
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
          onApiKeyChange={handleApiKeyChange}
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
        onApiKeyChange={handleApiKeyChange}
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
