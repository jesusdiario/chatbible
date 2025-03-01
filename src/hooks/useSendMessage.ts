
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';
import { Message } from '@/types';
import { useApiKey } from './useApiKey';

export function useSendMessage(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  currentChatId: string | null,
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>,
  saveCurrentChat: (chatId: string, messageList: Message[]) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { apiKey } = useApiKey();

  // Handle sending a message
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

      // Communication with OpenAI API
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

      // Save updated chat with assistant response
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
    isLoading,
    handleSendMessage
  };
}
