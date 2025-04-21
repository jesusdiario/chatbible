
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";

const pentateucoSlugs = ["genesis", "exodo", "levitico", "numeros"];

const LivrosDaBiblia = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

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
        <div className="pt-[60px] pb-4 px-8 bg-chatgpt-main text-white min-h-screen">
          <h1 className="text-2xl md:text-3xl font-bold mt-6">Pentateuco</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-5 mb-10">
            {pentateucoSlugs.map((slug) => {
              const { title } = bibleAssistants[slug];
              return (
                <Link
                  key={slug}
                  to={`/livros-da-biblia/${slug}`}
                  className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition bg-chatgpt-sidebar border border-chatgpt-border"
                >
                  <img
                    src={`/images/covers/${slug}.jpg`}
                    alt={`Capa de ${title}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2 bg-chatgpt-secondary">
                    <span className="text-sm font-medium">{title}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <h2 className="text-xl font-semibold mt-6 mb-2">Históricos</h2>
          <div className="min-h-[56px] mb-8"></div>

          <h2 className="text-xl font-semibold mt-6 mb-2">Poéticos e Proféticos</h2>
          <div className="min-h-[56px]"></div>
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;
