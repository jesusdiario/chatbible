
import { useState } from 'react';
import { Message } from '@/types';
import { useChatStorage } from './useChatStorage';
import { useChatManagement } from './useChatManagement';
import { useSendMessage } from './useSendMessage';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { chatHistory, setChatHistory, chatsData, setChatsData } = useChatStorage();
  
  const {
    currentChatId,
    setCurrentChatId,
    startNewChat,
    saveCurrentChat,
    handleChatSelect
  } = useChatManagement(setMessages, chatsData, setChatsData, setChatHistory);
  
  const {
    isLoading,
    handleSendMessage
  } = useSendMessage(messages, setMessages, currentChatId, setCurrentChatId, saveCurrentChat);

  return {
    messages,
    isLoading,
    currentChatId,
    startNewChat,
    handleSendMessage,
    handleChatSelect,
    chatHistory
  };
}
