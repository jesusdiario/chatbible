
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAssistants, Message as AssistantMessage } from '@/hooks/useAssistants';
import ChatInput from '@/components/ChatInput';
import MessageList from '@/components/MessageList';
import { Message } from '@/types';

const AssistantPage = () => {
  const { assistantId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [assistantName, setAssistantName] = useState('Assistente Especializado');
  const [assistantDescription, setAssistantDescription] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const { 
    assistants, 
    thread,
    createThread, 
    sendMessageToAssistant 
  } = useAssistants();

  // Buscar informações do assistente e criar um thread
  useEffect(() => {
    if (assistantId && assistants.length > 0) {
      const assistant = assistants.find(a => a.id === assistantId);
      if (assistant) {
        setAssistantName(assistant.name);
        setAssistantDescription(assistant.description || 'Assistente da OpenAI');
      }
    }
    
    // Criar um thread quando a página carregar
    if (!thread) {
      createThread();
    }
  }, [assistantId, assistants, thread]);

  const handleSendMessage = async (content: string) => {
    if (!assistantId || !thread || !content.trim()) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Adicionar mensagem do usuário imediatamente
    const userMessage: Message = {
      role: 'user',
      content
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      // Enviar mensagem para o assistant
      const threadMessages = await sendMessageToAssistant(
        assistantId,
        thread.id,
        content
      );
      
      // Converter as mensagens do formato da API para o nosso formato
      const formattedMessages = threadMessages.map((msg: AssistantMessage): Message => ({
        role: msg.role,
        content: msg.content[0]?.type === 'text' ? msg.content[0].text.value : ''
      }));
      
      // Atualizar mensagens na tela
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <div className="flex items-center gap-4 p-4 border-b border-slate-800">
        <Button 
          variant="ghost" 
          className="p-2" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{assistantName}</h1>
          <p className="text-sm text-gray-400">{assistantDescription}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-semibold mb-2">Assistente pronto para ajudar</h2>
            <p className="text-gray-400 mb-6">Envie uma mensagem para começar a conversa</p>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>
      
      <div className="p-4 border-t border-slate-800">
        {!thread ? (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default AssistantPage;
