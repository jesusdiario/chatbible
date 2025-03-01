
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types/messages';
import { RunStatus, AssistantDetailsResponse } from '@/types/assistant';
import { useApiKey } from '@/hooks/useApiKey';
import { 
  createThread, 
  addMessageToThread, 
  runAssistant, 
  checkRunStatus, 
  getThreadMessages,
  verifyAssistant
} from '@/services/assistantService';

export const useAssistant = (assistantId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [assistantVerified, setAssistantVerified] = useState<boolean | null>(null);
  const [assistantDetails, setAssistantDetails] = useState<AssistantDetailsResponse | null>(null);
  const { apiKey, handleApiKeyChange } = useApiKey();
  const { toast } = useToast();

  // Verificar o assistente quando o hook for montado e houver uma chave API
  useEffect(() => {
    if (apiKey && assistantVerified === null) {
      const verifyAssistantAccess = async () => {
        try {
          console.log(`Verificando acesso ao assistente: ${assistantId}`);
          const details = await verifyAssistant(assistantId, apiKey);
          setAssistantDetails(details);
          setAssistantVerified(true);
          console.log(`Assistente ${assistantId} verificado e pronto para uso`);
          console.log(`Nome: ${details.name}, Modelo: ${details.model}`);
        } catch (error: any) {
          console.error("Erro ao verificar assistente:", error);
          setAssistantVerified(false);
          toast({
            title: "Erro ao verificar assistente",
            description: error.message,
            variant: "destructive"
          });
        }
      };
      
      verifyAssistantAccess();
    }
  }, [apiKey, assistantId, assistantVerified, toast]);

  const saveApiKey = (newApiKey: string) => {
    const success = handleApiKeyChange(newApiKey);
    if (success) {
      // Redefina o estado de verificação do assistente
      setAssistantVerified(null);
      setAssistantDetails(null);
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

    // Verificação adicional para o assistente
    if (assistantVerified === false) {
      toast({
        title: "Erro",
        description: `O assistente ID ${assistantId} não está acessível com a chave API fornecida`,
        variant: "destructive"
      });
      return;
    }

    // Se ainda não verificamos o assistente, faça isso primeiro
    if (assistantVerified === null) {
      try {
        await verifyAssistant(assistantId, apiKey);
        setAssistantVerified(true);
      } catch (error: any) {
        setAssistantVerified(false);
        toast({
          title: "Erro ao verificar assistente",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
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
      const maxAttempts = 30; // 30 tentativas (cerca de 2.5 minutos)
      const checkInterval = 5000; // 5 segundos entre verificações

      while (runStatus === 'in_progress' || runStatus === 'queued') {
        if (attempts >= maxAttempts) {
          throw new Error('Tempo limite excedido ao aguardar resposta do assistente. Por favor, tente novamente mais tarde.');
        }

        // Wait between checks
        await new Promise(resolve => setTimeout(resolve, checkInterval));

        try {
          runStatus = await checkRunStatus(threadId, runId, apiKey);
          attempts++;

          console.log(`Run status: ${runStatus} (attempt ${attempts}/${maxAttempts})`);
        } catch (error: any) {
          console.error('Erro ao verificar status:', error);
          // Incluir detalhes específicos do erro no log
          if (error.message.includes("Falha na execução")) {
            throw error; // Propague o erro enriquecido
          }
          throw new Error(`Falha ao verificar o status da execução: ${error.message}`);
        }

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
          throw new Error(`A execução do assistente falhou: ${runStatus}. Verifique se o ID do assistente está correto e se sua chave API tem acesso a ele.`);
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
      setMessages(prev => prev.length > 0 ? prev.slice(0, -1) : []);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    apiKey,
    sendMessage,
    saveApiKey,
    assistantVerified,
    assistantDetails
  };
};
