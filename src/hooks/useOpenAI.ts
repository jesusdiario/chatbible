
import { useState } from 'react';
import { Message } from '@/types/message';
import { useToast } from '@/hooks/use-toast';

export const useOpenAI = (apiKey: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessageToOpenAI = async (messages: Message[]): Promise<Message | null> => {
    if (!apiKey) {
      toast({
        title: "Erro",
        description: "Por favor, adicione sua chave de API da OpenAI nas configurações",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages.map(msg => ({
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
      return {
        role: 'assistant',
        content: data.choices[0].message.content
      };
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessageToOpenAI,
    isLoading
  };
};
