
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types/messages';
import { RunStatus } from '@/types/assistant';
import { useApiKey } from '@/hooks/useApiKey';
import { 
  createThread, 
  addMessageToThread, 
  runAssistant, 
  checkRunStatus, 
  getThreadMessages 
} from '@/services/assistantService';

export const useAssistant = (assistantId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { apiKey, handleApiKeyChange } = useApiKey();
  const { toast } = useToast();

  const saveApiKey = (newApiKey: string) => {
    const success = handleApiKeyChange(newApiKey);
    if (success) {
      toast({
        title: "Sucesso",
        description: "Chave de API da OpenAI salva com sucesso"
      });
    }
    return success;
  };

  const sendMessage = async (content: string) => {
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

    setIsLoading(true);
    
    try {
      // Add user message to the list
      const newUserMessage = {
        role: 'user' as const,
        content
      };
      
      setMessages(prev => [...prev, newUserMessage]);

      // Create a thread
      const threadData = await createThread(apiKey);
      const threadId = threadData.id;

      // Add message to the thread
      await addMessageToThread(threadId, content, apiKey);

      // Run the assistant on the thread
      const runData = await runAssistant(threadId, assistantId, apiKey);
      const runId = runData.id;

      // Check the run status
      let runStatus: RunStatus = 'in_progress';
      let attempts = 0;
      const maxAttempts = 60; // About 5 minutes with 5 seconds between attempts

      while (runStatus === 'in_progress' || runStatus === 'queued') {
        if (attempts >= maxAttempts) {
          throw new Error('Tempo limite excedido ao aguardar resposta do assistente');
        }

        // Wait 5 seconds between checks
        await new Promise(resolve => setTimeout(resolve, 5000));

        runStatus = await checkRunStatus(threadId, runId, apiKey);
        attempts++;

        console.log(`Run status: ${runStatus} (attempt ${attempts}/${maxAttempts})`);

        // If completed, get the messages
        if (runStatus === 'completed') {
          const messagesData = await getThreadMessages(threadId, apiKey);
          
          // The most recent assistant response will be at the top
          const assistantMessage = messagesData.data.find(
            (msg: any) => msg.role === 'assistant'
          );

          if (assistantMessage) {
            const assistantContent = assistantMessage.content[0].text.value;
            
            // Add the assistant's response to the message list
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: assistantContent
            }]);
          }
          break;
        } else if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
          console.error(`Run failed with status: ${runStatus}`);
          throw new Error(`A execução do assistente falhou: ${runStatus}`);
        }
      }
    } catch (error: any) {
      console.error('Erro ao processar mensagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao comunicar com a API do OpenAI",
        variant: "destructive"
      });
      
      // Remove the user message if the API call failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    apiKey,
    sendMessage,
    saveApiKey
  };
};
