
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import ActionButtons, { ChatContext } from "@/components/ActionButtons";
import MessageList from "@/components/MessageList";
import { ChatHistory } from "@/types/chat";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const LivrosDaBibliaBook = () => {
  const { book } = useParams<{ book?: string }>();
  const config = book ? bibleAssistants[book] : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // API KEY é sempre lida do .env agora
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";

  if (book === "genesis" && config) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (content: string) => {
      if (!content.trim() || !apiKey) return;
      setIsLoading(true);
      try {
        const newMessages: Message[] = [...messages, { role: "user", content }];
        setMessages(newMessages);

        // Usar assistantId (não model), pois a API mudou!
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            messages: newMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            assistant: config.assistantId // Passa o assistantId do livro
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Erro ao comunicar com a OpenAI");
        }
        // Suporte ao formato novo da API OpenAI Assistants
        let assistantContent =
          data?.choices?.[0]?.message?.content ||
          data?.message?.content ||
          data?.content ||
          JSON.stringify(data, null, 2);

        setMessages([...newMessages, { role: "assistant", content: assistantContent }]);
      } catch (err: any) {
        setMessages(prev => [...prev, { role: "assistant", content: "Ocorreu um erro: " + (err?.message || "Erro inesperado") }]);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex h-screen">
        <Sidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onApiKeyChange={() => {}} // Não altera mais a key no frontend
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

  // Fallback para livros não encontrados ou rota inválida
  if (!config) {
    return (
      <div className="flex h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onApiKeyChange={() => {}}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <ChatHeader
            isSidebarOpen={isSidebarOpen}
          />
          <div className="pt-[60px] flex items-center justify-center min-h-[70vh] text-lg">
            Livro não encontrado.
          </div>
        </main>
      </div>
    );
  }

  // Outros livros: tela esperando integração futura
  return (
    <div className="flex h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onApiKeyChange={() => {}}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
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
