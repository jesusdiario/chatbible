
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import AssistantChat from '@/components/AssistantChat';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={setApiKey}
        onChatSelect={() => {}} 
        chatHistory={[]} 
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onNewChat={() => {}}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <AssistantChat 
          assistantId="asst_vK15nuJOl7DFWQu0VclHDZOq"
          emptyStateTitle="BibleGPT Assistant"
          emptyStateDescription="Pergunte-me sobre a Bíblia ou teologia para obter respostas baseadas nas Escrituras."
          placeholder="Digite sua pergunta bíblica ou teológica..."
        />
      </main>
    </div>
  );
};

export default Index;
