
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatContainer from '@/components/ChatContainer';
import { useChatState } from '@/hooks/useChatState';

const Index = () => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    messages,
    isLoading,
    chatHistory,
    startNewChat,
    handleSendMessage,
    handleApiKeyChange,
    handleChatSelect
  } = useChatState();

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
        
        <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
          <ChatContainer 
            messages={messages} 
            isLoading={isLoading} 
            onSendMessage={handleSendMessage} 
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
