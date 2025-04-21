
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import ActionButtons, { ChatContext } from "@/components/ActionButtons";
import LeviticusActionButtons from "@/components/LeviticusActionButtons";
import MessageList from "@/components/MessageList";
import { supabase } from "@/integrations/supabase/client";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const BIBLE_PROMPTS: Record<string, string> = {
  genesis: `Você é um especialista no livro de Gênesis da Bíblia. 
Seu papel é ajudar os usuários a entender este livro, suas histórias, significados e implicações teológicas.
Sempre baseie suas respostas no conteúdo Bíblico e entendimento acadêmico.
Seja conciso, claro e preciso em suas respostas.
Se não tiver certeza sobre algo, admita e sugira verificar com outras fontes.
Mantenha sempre um tom respeitoso e educacional.`,
  // ... outros prompts específicos podem ser adicionados aqui
};

const LivrosDaBibliaBook = () => {
  const { book } = useParams<{ book?: string }>();
  const config = book ? bibleAssistants[book] : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      const userMessage: Message = { role: "user", content };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          messages: newMessages,
          systemPrompt: book ? BIBLE_PROMPTS[book] : undefined
        }
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.content 
      };
      
      setMessages([...newMessages, assistantMessage]);

      // Save to chat history
      await supabase.from('chat_history').upsert({
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        book_slug: book,
        last_message: assistantMessage.content,
        last_accessed: new Date().toISOString(),
        messages: newMessages
      });

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

  // Default/fallback for missing book
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
          />
          <div className="pt-[60px] flex items-center justify-center min-h-[70vh] text-lg">
            Livro não encontrado.
          </div>
        </main>
      </div>
    );
  }

  const ActionButtonsComponent = book === 'levitico' ? LeviticusActionButtons : ActionButtons;

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
                <ActionButtonsComponent />
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
};

export default LivrosDaBibliaBook;
