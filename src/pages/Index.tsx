import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ActionButtons, { ChatContext } from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';
import { ChatHistory } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// Interface para armazenar mensagens de um chat específico
interface ChatData {
  id: string;
  title: string;
  messages: Message[];
  lastAccessed: Date;
}
const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('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');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [chatsData, setChatsData] = useState<Record<string, ChatData>>({});
  const {
    toast
  } = useToast();

  // Carregar histórico e dados dos chats do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    const savedChatsData = localStorage.getItem('chatsData');
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
  }, []);

  // Salvar histórico e dados dos chats no localStorage quando eles mudarem
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    if (Object.keys(chatsData).length > 0) {
      localStorage.setItem('chatsData', JSON.stringify(chatsData));
    }
  }, [chatHistory, chatsData]);

  // Função para iniciar um novo chat
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  // Função para salvar o chat atual
  const saveCurrentChat = (chatId: string, messageList: Message[]) => {
    if (messageList.length === 0) return;

    // Extrair título da primeira mensagem do usuário
    const firstUserMessage = messageList.find(msg => msg.role === 'user');
    const chatTitle = firstUserMessage ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '') : 'Nova conversa';
    const now = new Date();

    // Atualizar os dados do chat
    setChatsData(prev => ({
      ...prev,
      [chatId]: {
        id: chatId,
        title: chatTitle,
        messages: messageList,
        lastAccessed: now
      }
    }));

    // Atualizar o histórico
    setChatHistory(prev => {
      // Verificar se o chat já existe no histórico
      const existingIndex = prev.findIndex(item => item.id === chatId);
      if (existingIndex >= 0) {
        // Atualizar o chat existente
        const updatedHistory = [...prev];
        updatedHistory[existingIndex] = {
          ...updatedHistory[existingIndex],
          title: chatTitle,
          lastAccessed: now
        };
        return updatedHistory;
      } else {
        // Adicionar novo chat ao histórico
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

      // Atualizar os dados do chat
      setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...chatData,
          lastAccessed: now
        }
      }));

      // Atualizar o histórico
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

    // Criar um novo ID de chat se não existir
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

      // Salvar o estado atual do chat
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

      // Salvar o chat atualizado com a resposta do assistente
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
    // Fechar o sidebar em dispositivos móveis após selecionar um chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Carregar a chave da API do localStorage ao iniciar
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // Se não existir no localStorage, salva a chave padrão
      localStorage.setItem('openai_api_key', apiKey);
    }
  }, []);
  return <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} onApiKeyChange={handleApiKeyChange} onChatSelect={handleChatSelect} chatHistory={chatHistory} />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onNewChat={startNewChat} />
        
        <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
          {messages.length === 0 ? <div className="w-full max-w-3xl px-4 space-y-4">
              <div>
                <h1 className="mb-8 text-4xl font-semibold text-center">Como podemos ajudar?</h1>
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
              <ChatContext.Provider value={{
            sendMessage: handleSendMessage
          }}>
                <ActionButtons />
              </ChatContext.Provider>
            </div> : <>
              <MessageList messages={messages} />
              <div className="w-full max-w-3xl mx-auto px-4 py-2">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
              <div className="text-xs text-center text-gray-500 py-2">O BibleGPT pode cometer erros. Verifique informações importantes.</div>
            </>}
        </div>
      </main>
    </div>;
};
export default Index;