
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import ActionButtons, { ChatContext } from "@/components/ActionButtons";
import { ChatHistory } from "@/types/chat";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

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

const LivrosDaBibliaBook = () => {
  const { book } = useParams<{ book?: string }>();
  const config = book ? bibleAssistants[book] : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [chatsData, setChatsData] = useState<Record<string, ChatData>>({});
  const { toast } = useToast();

  // Carregar histórico e dados dos chats do localStorage
  useEffect(() => {
    if (book !== "genesis") return;
    const savedHistory = localStorage.getItem('genesis_chatHistory');
    const savedChatsData = localStorage.getItem('genesis_chatsData');
    if (savedHistory) {
      const history = JSON.parse(savedHistory, (key, value) => {
        if (key === 'lastAccessed') return new Date(value);
        return value;
      });
      setChatHistory(history);
    }
    if (savedChatsData) {
      const data = JSON.parse(savedChatsData, (key, value) => {
        if (key === 'lastAccessed') return new Date(value);
        return value;
      });
      setChatsData(data);
    }
  }, [book]);

  // Salvar histórico e dados dos chats no localStorage quando eles mudarem
  useEffect(() => {
    if (book !== "genesis") return;
    if (chatHistory.length > 0) {
      localStorage.setItem('genesis_chatHistory', JSON.stringify(chatHistory));
    }
    if (Object.keys(chatsData).length > 0) {
      localStorage.setItem('genesis_chatsData', JSON.stringify(chatsData));
    }
  }, [chatHistory, chatsData, book]);

  // Função para iniciar um novo chat
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  // Função para salvar o chat atual
  const saveCurrentChat = (chatId: string, messageList: Message[]) => {
    if (messageList.length === 0) return;
    const firstUserMessage = messageList.find(msg => msg.role === 'user');
    const chatTitle = firstUserMessage ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '') : 'Nova conversa';
    const now = new Date();
    setChatsData(prev => ({
      ...prev,
      [chatId]: {
        id: chatId,
        title: chatTitle,
        messages: messageList,
        lastAccessed: now
      }
    }));
    setChatHistory(prev => {
      const existingIndex = prev.findIndex(item => item.id === chatId);
      if (existingIndex >= 0) {
        const updatedHistory = [...prev];
        updatedHistory[existingIndex] = {
          ...updatedHistory[existingIndex],
          title: chatTitle,
          lastAccessed: now
        };
        return updatedHistory;
      } else {
        return [...prev, {
          id: chatId,
          title: chatTitle,
          lastAccessed: now
        }];
      }
    });
  };

  // Função para carregar um chat existente
  const loadChat = (chatId: string) => {
    const chatData = chatsData[chatId];
    if (chatData) {
      setCurrentChatId(chatId);
      setMessages(chatData.messages);

      // Atualizar a data de último acesso
      const now = new Date();

      setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...chatData,
          lastAccessed: now
        }
      }));
      setChatHistory(prev => {
        return prev.map(item => item.id === chatId ? {
          ...item,
          lastAccessed: now
        } : item);
      });
    } else {
      toast({
        title: "Erro",
        description: "Chat não encontrado",
        variant: "destructive"
      });
    }
  };

  // Envio de mensagem
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem",
        variant: "destructive"
      });
      return;
    }
    if (!apiKey) {
      toast({
        title: "Erro",
        description: "Por favor, adicione sua chave de API da OpenAI nas configurações",
        variant: "destructive"
      });
      return;
    }
    const chatId = currentChatId || uuidv4();
    if (!currentChatId) {
      setCurrentChatId(chatId);
    }
    setIsLoading(true);
    try {
      const newMessages = [...messages, {
        role: 'user',
        content
      } as const];
      setMessages(newMessages);
      saveCurrentChat(chatId, newMessages);

      // Comunicação com a API do OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 1000
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao comunicar com a API da OpenAI');
      }
      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveCurrentChat(chatId, updatedMessages);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
    toast({
      title: "Sucesso",
      description: "Chave de API da OpenAI salva com sucesso"
    });
  };

  const handleChatSelect = (chatId: string) => {
    loadChat(chatId);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Carregar a chave da API do localStorage ao iniciar
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Se não for rota de Gênesis, renderza placeholder padrão
  if (!config) {
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
          <div className="pt-[60px] flex items-center justify-center min-h-[70vh] text-lg">
            Livro não encontrado.
          </div>
        </main>
      </div>
    );
  }

  // Se for "genesis", renderiza o chat home interface completo
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

          <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
            {messages.length === 0 ? (
              <div className="w-full max-w-3xl px-4 space-y-4">
                <div>
                  <h1 className="mb-8 text-4xl font-semibold text-center">
                    Gênesis - Como podemos ajudar?
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

  // Fallback para outros livros
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
