
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { bibleAssistants } from "../config/bibleAssistants";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";

const categories = [
  { 
    title: 'Pentateuco', 
    slugs: ['genesis', 'exodo', 'levitico', 'numeros'] 
  },
  {
    title: 'Históricos',
    slugs: [
      'josue','juizes','rute',
      '1-samuel','2-samuel','1-reis','2-reis',
      '1-cronicas','2-cronicas',
      'esdras','neemias','tobias','judite','ester',
      '1-macabeus','2-macabeus'
    ]
  }
];

const LivrosDaBiblia = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={handleApiKeyChange}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-white min-h-screen">
          {categories.map(({ title, slugs }) => (
            <section key={title} className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-4">{title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {slugs.map(slug => {
                  const cfg = bibleAssistants[slug];
                  if (!cfg) return null;
                  return (
                    <Link
                      key={slug}
                      to={`/livros-da-biblia/${slug}`}
                      className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition bg-chatgpt-sidebar border border-chatgpt-border"
                    >
                      <img
                        src={`/images/covers/${slug}.jpg`}
                        alt={`Capa de ${cfg.title}`}
                        className="w-full h-36 sm:h-48 object-cover"
                      />
                      <div className="p-2 bg-chatgpt-secondary">
                        <span className="text-sm font-medium">{cfg.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
          {/* A seção Poéticos e Proféticos pode ser adicionada depois */}
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;
