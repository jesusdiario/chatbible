
import { useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import ActionButtons from "@/components/ActionButtons";
import Sidebar from "@/components/Sidebar";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleNewChat = () => {
    // Implementar lógica de nova conversa
    console.log("Nova conversa iniciada");
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar isOpen={isSidebarOpen} />
      
      <main className="flex-1 flex flex-col">
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={handleToggleSidebar}
          onNewChat={handleNewChat}
        />
        
        <div className="flex-1 overflow-hidden relative">
          <MessageList />
          <ActionButtons />
        </div>
        
        <div className="p-4 border-t border-slate-700">
          <ChatInput />
        </div>
      </main>
    </div>
  );
};

export default Index;
