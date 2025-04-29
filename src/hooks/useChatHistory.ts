
import { useState, useEffect, useCallback } from 'react';
import { ChatHistory } from '@/types/chat';
import { fetchChatHistory } from '@/utils/chatHistoryUtils';

/**
 * Hook to manage chat history state and loading
 */
export const useChatHistory = (userId: string | null) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  
  const loadChatHistory = useCallback(async () => {
    if (!userId) return;
    
    const history = await fetchChatHistory(userId);
    setChatHistory(history);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadChatHistory();
    }
  }, [userId, loadChatHistory]);

  return {
    chatHistory,
    setChatHistory,
    loadChatHistory
  };
};
