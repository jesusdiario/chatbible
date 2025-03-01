
import { useState, useEffect } from 'react';
import { Message, ChatData } from '@/types/message';
import { ChatHistory } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { saveChat } from '@/utils/chatUtils';
import { useToast } from '@/hooks/use-toast';
import { useOpenAI } from '@/hooks/useOpenAI';

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [chatsData, setChatsData] = useState<Record<string, ChatData>>({});
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();
  const { sendMessageToOpenAI, isLoading } = useOpenAI(apiKey);

  // Carregar histórico e dados dos chats do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    const savedChatsData = localStorage.getItem('chatsData');
    const savedApiKey = localStorage.getItem('openai_api_key');
    
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
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      const defaultKey = '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';
      setApiKey(defaultKey);
      localStorage.setItem('openai_api_key', defaultKey);
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

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
    toast({
      title: "Sucesso",
      description: "Chave de API da OpenAI salva com sucesso"
    });
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

    // Criar um novo ID de chat se não existir
    const chatId = currentChatId || uuidv4();
    if (!currentChatId) {
      setCurrentChatId(chatId);
    }

    const newUserMessage: Message = {
      role: 'user',
      content
    };
    
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);

    // Salvar o estado atual do chat
    saveChat(chatId, newMessages, setChatsData, setChatHistory);

    // Enviar mensagem para a API da OpenAI
    const assistantMessage = await sendMessageToOpenAI(newMessages);
    
    if (assistantMessage) {
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      
      // Salvar o chat atualizado com a resposta do assistente
      saveChat(chatId, updatedMessages, setChatsData, setChatHistory);
    }
  };

  return {
    messages,
    isLoading,
    apiKey,
    currentChatId,
    chatHistory,
    chatsData,
    setCurrentChatId,
    setMessages,
    startNewChat,
    handleApiKeyChange,
    handleSendMessage,
    setChatsData,
    setChatHistory
  };
};
