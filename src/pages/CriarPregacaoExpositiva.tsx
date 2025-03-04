
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContent from '@/components/ChatContent';
import usePregacaoExpositiva from '@/hooks/usePregacaoExpositiva';

const CriarPregacaoExpositiva = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
    messages,
    isLoading,
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
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onNewChat={startNewChat}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
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
