
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { useApiKey } from './useApiKey';

export type Assistant = {
  id: string;
  name: string;
  description: string | null;
  instructions: string;
  model: string;
  created_at: number;
};

export type Thread = {
  id: string;
  created_at: number;
};

export type Message = {
  id: string;
  thread_id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text';
    text: {
      value: string;
    };
  }>;
  created_at: number;
};

export function useAssistants() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const { toast } = useToast();
  const { apiKey } = useApiKey();

  // Buscar assistentes disponíveis
  useEffect(() => {
    if (apiKey) {
      fetchAssistants();
    }
  }, [apiKey]);

  const fetchAssistants = async () => {
    if (!apiKey) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/assistants?limit=100', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro ao buscar assistentes');
      }
      
      const data = await response.json();
      setAssistants(data.data);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar um novo thread de conversa
  const createThread = async () => {
    if (!apiKey) return null;
    
    try {
      const response = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erro ao criar thread');
      }
      
      const newThread = await response.json();
      setThread(newThread);
      return newThread;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Enviar mensagem para um assistant
  const sendMessageToAssistant = async (
    assistantId: string, 
    threadId: string, 
    message: string
  ): Promise<Message[]> => {
    if (!apiKey) return [];
    
    try {
      // 1. Adicionar a mensagem ao thread
      const addMessageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({
          role: 'user',
          content: message
        })
      });
      
      if (!addMessageResponse.ok) {
        const error = await addMessageResponse.json();
        throw new Error(error.error?.message || 'Erro ao adicionar mensagem');
      }
      
      // 2. Executar o assistant no thread
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
        const error = await runResponse.json();
        throw new Error(error.error?.message || 'Erro ao executar o assistant');
      }
      
      const run = await runResponse.json();
      
      // 3. Verificar o status da execução a cada 1 segundo
      let runStatus = run.status;
      let runId = run.id;
      
      while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'expired') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v1'
          }
        });
        
        if (!statusResponse.ok) {
          const error = await statusResponse.json();
          throw new Error(error.error?.message || 'Erro ao verificar status');
        }
        
        const statusData = await statusResponse.json();
        runStatus = statusData.status;
      }
      
      if (runStatus === 'failed' || runStatus === 'expired') {
        throw new Error(`A execução ${runStatus}`);
      }
      
      // 4. Buscar as mensagens após a conclusão
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?limit=100`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });
      
      if (!messagesResponse.ok) {
        const error = await messagesResponse.json();
        throw new Error(error.error?.message || 'Erro ao buscar mensagens');
      }
      
      const messagesData = await messagesResponse.json();
      return messagesData.data.sort((a: Message, b: Message) => a.created_at - b.created_at);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      return [];
    }
  };

  return {
    assistants,
    loading,
    thread,
    fetchAssistants,
    createThread,
    sendMessageToAssistant
  };
}
