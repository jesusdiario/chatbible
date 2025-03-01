
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContent from '@/components/ChatContent';
import { useChatState } from '@/hooks/useChatState';
import { loadChatData } from '@/utils/chatUtils';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    messages,
    isLoading,
    apiKey,
    currentChatId,
    chatHistory,
    chatsData,
    setCurrentChatId,
    setMessages,
    startNewChat,
    handleApiKeyChange,
    handleSendMessage,
    setChatsData,
    setChatHistory
  } = useChatState();

  const handleChatSelect = (chatId: string) => {
    loadChatData(
      chatId,
      chatsData,
      setCurrentChatId,
      setMessages,
      setChatsData,
      setChatHistory,
      (message) => toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      })
    );
    
    // Fechar o sidebar em dispositivos móveis após selecionar um chat
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

export default Index;
