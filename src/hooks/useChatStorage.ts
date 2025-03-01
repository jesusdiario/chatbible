
import { useState, useEffect } from 'react';
import { ChatHistory } from '@/types/chat';
import { ChatData } from '@/types';

export function useChatStorage() {
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

  return {
    chatHistory,
    setChatHistory,
    chatsData,
    setChatsData
  };
}
