
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

      console.log(`Criando thread para o assistante: ${assistantId}`);
      // Create a thread
      const threadData = await createThread(apiKey);
      const threadId = threadData.id;
      console.log(`Thread criada: ${threadId}`);

      // Add message to the thread
      await addMessageToThread(threadId, content, apiKey);
      console.log(`Mensagem adicionada à thread`);

      // Run the assistant on the thread
      console.log(`Executando assistente: ${assistantId}`);
      const runData = await runAssistant(threadId, assistantId, apiKey);
      const runId = runData.id;
      console.log(`Run criada: ${runId}`);

      // Check the run status
      let runStatus: RunStatus = runData.status as RunStatus || 'in_progress';
      let attempts = 0;
      const maxAttempts = 30; // Reduzido para 30 tentativas (cerca de 2.5 minutos)
      const checkInterval = 5000; // 5 segundos entre verificações

      while (runStatus === 'in_progress' || runStatus === 'queued') {
        if (attempts >= maxAttempts) {
          throw new Error('Tempo limite excedido ao aguardar resposta do assistente. Por favor, tente novamente mais tarde.');
        }

        // Wait between checks
        await new Promise(resolve => setTimeout(resolve, checkInterval));

        runStatus = await checkRunStatus(threadId, runId, apiKey);
        attempts++;

        console.log(`Run status: ${runStatus} (attempt ${attempts}/${maxAttempts})`);

        // If completed, get the messages
        if (runStatus === 'completed') {
          console.log('Run concluída, obtendo mensagens...');
          const messagesData = await getThreadMessages(threadId, apiKey);
          
          // The most recent assistant response will be at the top
          const assistantMessage = messagesData.data.find(
            (msg: any) => msg.role === 'assistant'
          );

          if (assistantMessage) {
            const assistantContent = assistantMessage.content[0].text.value;
            console.log('Resposta do assistente recebida');
            
            // Add the assistant's response to the message list
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: assistantContent
            }]);
          } else {
            console.log('Nenhuma resposta do assistente encontrada');
            throw new Error('Não foi possível obter a resposta do assistente');
          }
          break;
        } else if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
          console.error(`Run falhou com status: ${runStatus}`);
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
