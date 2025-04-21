
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";

const LivrosDaBibliaBook = () => {
  const { book } = useParams<{ book?: string }>();
  const config = book ? bibleAssistants[book] : null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  if (!config) {
    return (
      <div className="flex h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          onApiKeyChange={handleApiKeyChange}
        />
        
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen} 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          <div className="pt-[60px] flex items-center justify-center min-h-[70vh] text-lg">
            Livro não encontrado.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={handleApiKeyChange}
      />
      
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <div className="pt-[60px] p-6">
          <h1 className="text-3xl font-bold mb-4">
            Converse com {config.title}
          </h1>
          <div className="rounded shadow text-lg bg-slate-900/60 p-6">
            (Chat dedicado para {config.title} em breve!)
          </div>
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBibliaBook;
