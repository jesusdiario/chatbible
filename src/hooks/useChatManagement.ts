
import { useState } from 'react';
import { useToast } from './use-toast';
import { Message, ChatData } from '@/types';

export function useChatManagement(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  chatsData: Record<string, ChatData>,
  setChatsData: React.Dispatch<React.SetStateAction<Record<string, ChatData>>>,
  setChatHistory: React.Dispatch<React.SetStateAction<any[]>>,
) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const { toast } = useToast();

  // Start a new chat
  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
  };

  // Save the current chat
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

  // Load an existing chat
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

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    loadChat(chatId);
  };

  return {
    currentChatId,
    setCurrentChatId,
    startNewChat,
    saveCurrentChat,
    handleChatSelect
  };
}
