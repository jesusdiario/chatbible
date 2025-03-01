
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import EmptyStateChat from '@/components/EmptyStateChat';
import MainChat from '@/components/MainChat';
import { useChat } from '@/hooks/useChat';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {
    messages,
    isLoading,
    chatHistory,
    startNewChat,
    loadChat,
    handleSendMessage,
    handleApiKeyChange
  } = useChat();

  const handleChatSelect = (chatId: string) => {
    loadChat(chatId);
    // Close sidebar on mobile after selecting a chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={handleApiKeyChange} 
        onChatSelect={handleChatSelect} 
        chatHistory={chatHistory} 
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onNewChat={startNewChat} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
          {messages.length === 0 ? (
            <EmptyStateChat 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          ) : (
            <MainChat 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
