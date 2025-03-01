
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatData } from '@/types/messages';
import { ChatHistory } from '@/types/chat';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [chatsData, setChatsData] = useState<Record<string, ChatData>>({});
  const { toast } = useToast();

  // Load chat history and data from localStorage
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

  // Save chat history and data to localStorage when they change
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    if (Object.keys(chatsData).length > 0) {
      localStorage.setItem('chatsData', JSON.stringify(chatsData));
    }
  }, [chatHistory, chatsData]);

  // Load API key from localStorage when component mounts
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // If it doesn't exist in localStorage, save default key
      const defaultKey = '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';
      localStorage.setItem('openai_api_key', defaultKey);
      setApiKey(defaultKey);
    }
  }, []);

  // Function to start a new chat
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  // Function to save the current chat
  const saveCurrentChat = (chatId: string, messageList: Message[]) => {
    if (messageList.length === 0) return;

    // Extract title from the first user message
    const firstUserMessage = messageList.find(msg => msg.role === 'user');
    const chatTitle = firstUserMessage 
      ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '') 
      : 'Nova conversa';
    const now = new Date();

    // Update chat data
    setChatsData(prev => ({
      ...prev,
      [chatId]: {
        id: chatId,
        title: chatTitle,
        messages: messageList,
        lastAccessed: now
      }
    }));

    // Update chat history
    setChatHistory(prev => {
      // Check if chat already exists in history
      const existingIndex = prev.findIndex(item => item.id === chatId);
      if (existingIndex >= 0) {
        // Update existing chat
        const updatedHistory = [...prev];
        updatedHistory[existingIndex] = {
          ...updatedHistory[existingIndex],
          title: chatTitle,
          lastAccessed: now
        };
        return updatedHistory;
      } else {
        // Add new chat to history
        return [...prev, {
          id: chatId,
          title: chatTitle,
          lastAccessed: now
        }];
      }
    });
  };

  // Function to load an existing chat
  const loadChat = (chatId: string) => {
    const chatData = chatsData[chatId];
    if (chatData) {
      setCurrentChatId(chatId);
      setMessages(chatData.messages);

      // Update last accessed date
      const now = new Date();

      // Update chat data
      setChatsData(prev => ({
        ...prev,
        [chatId]: {
          ...chatData,
          lastAccessed: now
        }
      }));

      // Update chat history
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

  // Function to handle sending a message
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

    // Create a new chat ID if it doesn't exist
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

      // Save current chat state
      saveCurrentChat(chatId, newMessages);

      // Communicate with OpenAI API
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

      // Save updated chat with assistant's response
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

  // Function to handle API key change
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
    toast({
      title: "Sucesso",
      description: "Chave de API da OpenAI salva com sucesso"
    });
  };

  return {
    messages,
    isLoading,
    apiKey,
    currentChatId,
    chatHistory,
    startNewChat,
    loadChat,
    handleSendMessage,
    handleApiKeyChange
  };
};
