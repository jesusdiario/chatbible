
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export const useAssistant = (assistantId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();

  // Load API key from localStorage on initialization
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const saveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
    toast({
      title: "Sucesso",
      description: "Chave de API da OpenAI salva com sucesso"
    });
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
      const newMessages = [...messages, {
        role: 'user',
        content
      } as const];
      
      setMessages(newMessages);

      // Create or retrieve a thread
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        throw new Error('Erro ao criar thread');
      }

      const threadData = await threadResponse.json();
      const threadId = threadData.id;

      // Add message to the thread
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({
          role: 'user',
          content
        })
      });

      if (!messageResponse.ok) {
        throw new Error('Erro ao adicionar mensagem');
      }

      // Run the assistant on the thread
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({
          assistant_id: assistantId
        })
      });

      if (!runResponse.ok) {
        throw new Error('Erro ao executar o assistente');
      }

      const runData = await runResponse.json();
      const runId = runData.id;

      // Check the run status
      let runStatus = 'in_progress';
      let attempts = 0;
      const maxAttempts = 60; // About 5 minutes with 5 seconds between attempts

      while (runStatus === 'in_progress' || runStatus === 'queued') {
        if (attempts >= maxAttempts) {
          throw new Error('Tempo limite excedido ao aguardar resposta do assistente');
        }

        // Wait 5 seconds between checks
        await new Promise(resolve => setTimeout(resolve, 5000));

        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v1'
          }
        });

        if (!statusResponse.ok) {
          throw new Error('Erro ao verificar status da execução');
        }

        const statusData = await statusResponse.json();
        runStatus = statusData.status;
        attempts++;

        // If completed, get the messages
        if (runStatus === 'completed') {
          const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'OpenAI-Beta': 'assistants=v1'
            }
          });

          if (!messagesResponse.ok) {
            throw new Error('Erro ao obter mensagens');
          }

          const messagesData = await messagesResponse.json();
          
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
