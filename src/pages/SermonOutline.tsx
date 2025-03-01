
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import { v4 as uuidv4 } from 'uuid';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const SermonOutline = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const { toast } = useToast();
  const assistantId = 'asst_Esboço_de_Pregação'; // ID do seu assistente

  // Carregar a chave da API do localStorage ao iniciar
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

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

    setIsLoading(true);
    
    try {
      // Adiciona a mensagem do usuário à lista
      const newMessages = [...messages, {
        role: 'user',
        content
      } as const];
      
      setMessages(newMessages);

      // Comunicação com a API do OpenAI para o Assistant
      // Primeiro, cria ou recupera um thread
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

      // Adiciona a mensagem ao thread
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

      // Executa o assistente no thread
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

      // Verifica o status da execução do assistente
      let runStatus = 'in_progress';
      let attempts = 0;
      const maxAttempts = 60; // Aproximadamente 5 minutos com 5 segundos entre tentativas

      while (runStatus === 'in_progress' || runStatus === 'queued') {
        if (attempts >= maxAttempts) {
          throw new Error('Tempo limite excedido ao aguardar resposta do assistente');
        }

        // Aguarda 5 segundos entre verificações
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

        // Se completou, obtém as mensagens
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
          
          // A resposta mais recente do assistente estará no topo
          const assistantMessage = messagesData.data.find(
            (msg: any) => msg.role === 'assistant'
          );

          if (assistantMessage) {
            const assistantContent = assistantMessage.content[0].text.value;
            
            // Adiciona a resposta do assistente à lista de mensagens
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

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
    toast({
      title: "Sucesso",
      description: "Chave de API da OpenAI salva com sucesso"
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={handleApiKeyChange}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
          <div className="text-center py-4">
            <h1 className="text-2xl font-semibold mb-2">Esboço de Pregação</h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Crie esboços de pregações expositivas com base em textos bíblicos utilizando o assistente especializado.
            </p>
          </div>
          
          {messages.length > 0 ? (
            <>
              <MessageList messages={messages} />
              <div className="w-full max-w-3xl mx-auto px-4 py-2">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
              <div className="text-xs text-center text-gray-500 py-2">
                O assistente Esboço de Pregação pode cometer erros. Verifique informações importantes.
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-3xl px-4 space-y-4">
                <div>
                  <ChatInput 
                    onSend={handleSendMessage} 
                    isLoading={isLoading} 
                    placeholder="Exemplo: Crie um esboço para uma pregação sobre João 3:16"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SermonOutline;
