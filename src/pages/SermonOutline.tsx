
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import SermonOutlineHeader from '@/components/SermonOutlineHeader';
import EmptyState from '@/components/EmptyState';
import ChatContainer from '@/components/ChatContainer';
import { useAssistant } from '@/hooks/useAssistant';
import { useToast } from '@/hooks/use-toast';

const SermonOutline = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // ID do assistente "Esboço de Pregação"
  const assistantId = 'asst_vK15nuJOl7DFWQu0VclHDZOq';
  const { toast } = useToast();
  
  const { 
    messages, 
    isLoading, 
    apiKey, 
    sendMessage, 
    saveApiKey,
    assistantVerified,
    assistantDetails
  } = useAssistant(assistantId);

  // Efeito para verificar se a chave API está configurada
  useEffect(() => {
    if (!apiKey) {
      toast({
        title: "Aviso",
        description: "Por favor, configure sua chave de API da OpenAI no menu lateral para utilizar esta funcionalidade.",
      });
    }
  }, [apiKey, toast]);

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={saveApiKey}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
          <SermonOutlineHeader />
          
          {messages.length > 0 ? (
            <ChatContainer 
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          ) : (
            <EmptyState 
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          )}
          
          {assistantVerified === false && (
            <div className="text-center p-3 my-2 bg-red-50 text-red-600 rounded-md border border-red-200">
              <p className="font-semibold">O assistente não está disponível ou a chave API não tem permissão para acessá-lo.</p>
              <p className="text-sm mt-1">ID do assistente: {assistantId}</p>
              <p className="text-sm">Verifique se este assistente existe na sua conta da OpenAI e se a chave API tem acesso a ele.</p>
            </div>
          )}
          
          {assistantVerified === true && assistantDetails && (
            <div className="text-center p-2 my-2 bg-green-50 text-green-600 rounded-md border border-green-200">
              <p>Assistente conectado: <span className="font-semibold">{assistantDetails.name || assistantId}</span></p>
              <p className="text-xs">Modelo: {assistantDetails.model}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SermonOutline;
