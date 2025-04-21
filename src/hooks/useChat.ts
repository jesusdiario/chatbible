
import { useState } from 'react';
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

export const useChat = (apiKey: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  const saveCurrentChat = (chatId: string, messageList: Message[], chatsData: Record<string, ChatData>, setChatsData: (data: Record<string, ChatData>) => void, setChatHistory: (fn: (prev: any[]) => any[]) => void) => {
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
      }
      return [...prev, { id: chatId, title: chatTitle, lastAccessed: now }];
    });
  };

  const loadChat = (chatId: string, chatData: ChatData) => {
    setCurrentChatId(chatId);
    setMessages(chatData.messages);
  };

  const sendMessage = async (content: string, chatsData: Record<string, ChatData>, setChatsData: any, setChatHistory: any) => {
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
      const newMessages = [...messages, { role: 'user', content } as const];
      setMessages(newMessages);
      saveCurrentChat(chatId, newMessages, chatsData, setChatsData, setChatHistory);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
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
      saveCurrentChat(chatId, updatedMessages, chatsData, setChatsData, setChatHistory);
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

  return {
    messages,
    isLoading,
    currentChatId,
    startNewChat,
    loadChat,
    sendMessage
  };
};
