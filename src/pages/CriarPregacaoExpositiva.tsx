
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContent from '@/components/ChatContent';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types/message';
import { ChatHistory } from '@/types/chat';

// Custom hook for handling the Pregação Expositiva chat state with Assistant
const usePregacaoExpositiva = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fixed OpenAI API key for this specific page
  const apiKey = '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';
  // Assistant ID específico
  const assistantId = 'asst_vK15nuJOl7DFWQu0VclHDZOq';

  useEffect(() => {
    // Criar um novo thread ao iniciar
    createThread();
  }, []);

  // Função para criar um novo thread
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
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao criar thread');
      }

      const data = await response.json();
      setThreadId(data.id);
      console.log('Thread criado:', data.id);
    } catch (error: any) {
      console.error('Erro ao criar thread:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    createThread(); // Criar um novo thread
  };

  // Função para enviar mensagem para o Assistant
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem",
        variant: "destructive"
      });
      return;
    }

    if (!threadId) {
      toast({
        title: "Erro",
        description: "Thread não foi criado. Tente novamente.",
        variant: "destructive"
      });
      return;
    }

    const newUserMessage: Message = {
      role: 'user',
      content
    };
    
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 1. Adicionar mensagem ao thread
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
        const errorData = await messageResponse.json();
        throw new Error(errorData.error?.message || 'Erro ao enviar mensagem');
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
        const errorData = await runResponse.json();
        throw new Error(errorData.error?.message || 'Erro ao executar o assistant');
      }

      const runData = await runResponse.json();
      const runId = runData.id;

      // 3. Verificar status da execução (polling)
      let runStatus = 'in_progress';
      while (runStatus === 'in_progress' || runStatus === 'queued') {
        // Esperar um pouco antes de verificar novamente
        await new Promise(resolve => setTimeout(resolve, 1000));

        const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'OpenAI-Beta': 'assistants=v1'
          }
        });

        if (!statusResponse.ok) {
          const errorData = await statusResponse.json();
          throw new Error(errorData.error?.message || 'Erro ao verificar status');
        }

        const statusData = await statusResponse.json();
        runStatus = statusData.status;

        // Se ocorrer um erro na execução
        if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
          throw new Error(`Execução ${runStatus}: ${statusData.last_error?.message || 'Erro desconhecido'}`);
        }
      }

      // 4. Obter as mensagens após a execução concluída
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json();
        throw new Error(errorData.error?.message || 'Erro ao obter mensagens');
      }

      const messagesData = await messagesResponse.json();
      
      // A primeira mensagem na lista é a mais recente
      const assistantMessage = messagesData.data.find((msg: any) => msg.role === 'assistant');
      
      if (assistantMessage) {
        const assistantContent = assistantMessage.content[0].text.value;
        
        const newAssistantMessage: Message = {
          role: 'assistant',
          content: assistantContent
        };

        setMessages([...newMessages, newAssistantMessage]);
      }
    } catch (error: any) {
      console.error('Erro na interação com o Assistant:', error);
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
    currentChatId,
    chatHistory,
    setChatHistory,
    setCurrentChatId,
    setMessages,
    startNewChat,
    handleSendMessage
  };
};

const CriarPregacaoExpositiva = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
    messages,
    isLoading,
    currentChatId,
    chatHistory,
    setCurrentChatId,
    setMessages,
    startNewChat,
    handleSendMessage
  } = usePregacaoExpositiva();

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={() => {}} // Not used for this page
        onChatSelect={() => {}} // Not used for this page 
        chatHistory={[]} // Not used for this page
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onNewChat={startNewChat} />
        
        <ChatContent 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
        />
      </main>
    </div>
  );
};

export default CriarPregacaoExpositiva;
