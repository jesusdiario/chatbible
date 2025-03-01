
import { useState, useEffect } from 'react';
import { ChatHistory } from '@/types/chat';
import { ChatData, Message } from '@/types/messages';

export const useChatHistory = () => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [chatsData, setChatsData] = useState<Record<string, ChatData>>({});

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

  // Function to start a new chat
  const startNewChat = () => {
    setCurrentChatId(null);
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
  const loadChat = (chatId: string, setMessages: (messages: Message[]) => void) => {
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
      
      return true;
    }
    
    return false;
  };

  return {
    currentChatId,
    setCurrentChatId,
    chatHistory,
    chatsData,
    startNewChat,
    saveCurrentChat,
    loadChat
  };
};
