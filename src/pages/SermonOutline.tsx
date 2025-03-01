
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import SermonOutlineHeader from '@/components/SermonOutlineHeader';
import EmptyState from '@/components/EmptyState';
import ChatContainer from '@/components/ChatContainer';
import { useAssistant } from '@/hooks/useAssistant';

const SermonOutline = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Este é o ID do assistente "Esboço de Pregação"
  const assistantId = 'asst_vK15nuJOl7DFWQu0VclHDZOq';
  
  const { 
    messages, 
    isLoading, 
    apiKey, 
    sendMessage, 
    saveApiKey 
  } = useAssistant(assistantId);

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
        </div>
      </main>
    </div>
  );
};

export default SermonOutline;
