
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types/messages';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useApiKey } from '@/hooks/useApiKey';
import { sendMessageToOpenAI } from '@/services/openaiService';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { apiKey, handleApiKeyChange } = useApiKey();
  const { 
    currentChatId, 
    setCurrentChatId, 
    chatHistory, 
    saveCurrentChat, 
    startNewChat: resetCurrentChat, 
    loadChat 
  } = useChatHistory();
  const { toast } = useToast();

  // Function to start a new chat
  const startNewChat = () => {
    resetCurrentChat();
    setMessages([]);
  };

  // Function to load an existing chat
  const loadExistingChat = (chatId: string) => {
    const success = loadChat(chatId, setMessages);
    if (!success) {
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
      const assistantResponse = await sendMessageToOpenAI(newMessages, apiKey);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantResponse
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

  return {
    messages,
    isLoading,
    apiKey,
    currentChatId,
    chatHistory,
    startNewChat,
    loadChat: loadExistingChat,
    handleSendMessage,
    handleApiKeyChange
  };
};
