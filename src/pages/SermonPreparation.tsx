
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const SermonPreparation = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thread, setThread] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();

  // Carregar a chave da API do localStorage ao iniciar
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Criar um novo thread quando a página é carregada
  useEffect(() => {
    if (apiKey) {
      createThread();
    }
  }, [apiKey]);

  const createThread = async () => {
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
        throw new Error('Erro ao criar thread');
      }

      const data = await response.json();
      setThread(data.id);
      
      // Adicionar mensagem de boas-vindas
      setMessages([
        {
          role: 'assistant',
          content: 'Olá! Sou o assistente de Esboço de Pregação. Como posso ajudar com sua pregação expositiva hoje?'
        }
      ]);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

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
    if (!thread) {
      toast({
        title: "Erro",
        description: "Aguarde a criação do thread",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Adicionar a mensagem do usuário à lista
      const userMessage: Message = {
        role: 'user',
        content
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Enviar mensagem para o Assistant
      const messageResponse = await fetch(`https://api.openai.com/v1/threads/${thread}/messages`, {
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
        const errorData = await messageResponse.json();
        throw new Error(errorData.error?.message || 'Erro ao enviar mensagem');
      }

      // Executar o assistant no thread
      const runResponse = await fetch(`https://api.openai.com/v1/threads/${thread}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({
          assistant_id: 'asst_Esboço de Pregação',
          instructions: "Você é um assistente especializado em criação de pregações expositivas."
        })
      });

      if (!runResponse.ok) {
        const errorData = await runResponse.json();
        throw new Error(errorData.error?.message || 'Erro ao executar o assistant');
      }

      const runData = await runResponse.json();
      const runId = runData.id;

      // Verificar o status da execução
      await checkRunStatus(thread, runId);

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const checkRunStatus = async (threadId: string, runId: string) => {
    try {
      const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao verificar status');
      }

      const data = await response.json();
      
      if (data.status === 'completed') {
        // Buscar as mensagens após a conclusão
        await getMessages(threadId);
      } else if (data.status === 'failed' || data.status === 'cancelled' || data.status === 'expired') {
        throw new Error(`Execução falhou com status: ${data.status}`);
      } else {
        // Se ainda estiver em andamento, verificar novamente após um intervalo
        setTimeout(() => checkRunStatus(threadId, runId), 1000);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const getMessages = async (threadId: string) => {
    try {
      const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao buscar mensagens');
      }

      const data = await response.json();
      
      // Extrair a última mensagem do assistente
      const assistantMessages = data.data.filter((msg: any) => msg.role === 'assistant');
      
      if (assistantMessages.length > 0) {
        const latestMessage = assistantMessages[0]; // A API retorna em ordem decrescente
        const content = latestMessage.content[0].text.value;
        
        // Adicionar a mensagem do assistente à lista
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content
          }
        ]);
      }
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

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader 
        isSidebarOpen={false} 
        onNewChat={() => navigate('/')} 
        title="Esboço de Pregação"
      />
      
      <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
        <MessageList messages={messages} />
        <div className="w-full max-w-3xl mx-auto px-4 py-2">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
        <div className="text-xs text-center text-gray-500 py-2">
          Utilizando o Assistant "Esboço de Pregação" da OpenAI
        </div>
      </div>
    </div>
  );
};

export default SermonPreparation;
