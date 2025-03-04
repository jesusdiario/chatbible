
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContent from '@/components/ChatContent';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/types/message';
import { ChatHistory } from '@/types/chat';

// Custom hook for handling the Pregação Expositiva chat state
const usePregacaoExpositiva = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const { toast } = useToast();
  
  // Fixed OpenAI API key for this specific page
  const apiKey = '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';

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
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

    const newUserMessage: Message = {
      role: 'user',
      content
    };
    
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
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
          messages: newMessages.map(msg => ({
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
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages([...newMessages, assistantMessage]);
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
  const { toast } = useToast();
  
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
