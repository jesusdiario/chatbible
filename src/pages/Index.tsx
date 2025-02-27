
import { useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import ActionButtons from "@/components/ActionButtons";
import Sidebar from "@/components/Sidebar";

// Tipo de mensagem
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [apiKey, setApiKey] = useState("");

  const handleNewChat = () => {
    // Implementar lógica de nova conversa
    console.log("Nova conversa iniciada");
    setMessages([]);
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = (content: string) => {
    // Adicionar mensagem do usuário
    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    // Simular resposta do assistente (pode ser substituído por chamada real à API)
    setTimeout(() => {
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: "Esta é uma resposta temporária. Conecte com a API da OpenAI para respostas reais."
      };
      setMessages([...newMessages, assistantMessage]);
    }, 1000);
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        onApiKeyChange={handleApiKeyChange}
      />
      
      <main className="flex-1 flex flex-col">
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={handleToggleSidebar}
          onNewChat={handleNewChat}
        />
        
        <div className="flex-1 overflow-hidden relative">
          <MessageList messages={messages} />
          <ActionButtons />
        </div>
        
        <div className="p-4 border-t border-slate-700">
          <ChatInput onSend={handleSendMessage} />
        </div>
      </main>
    </div>
  );
};

export default Index;
