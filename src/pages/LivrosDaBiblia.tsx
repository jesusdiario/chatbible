
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { BookGrid } from "@/components/BookGrid";
import { useBibleData } from "@/hooks/useBibleData";

const LivrosDaBiblia = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const { categories, booksByCategory, isLoading, isError, error } = useBibleData();

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  if (isError) {
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
            <div className="p-4 bg-red-900 rounded">
              <p className="font-bold">Falha ao carregar dados:</p>
              <pre className="mt-2 overflow-auto text-sm">{JSON.stringify(error, null, 2)}</pre>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-12">
              {categories.map(category => {
                const categoryBooks = booksByCategory[category.slug] || [];
                return (
                  <section key={category.slug} className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-4">{category.title}</h2>
                    {category.description && (
                      <p className="text-gray-300 mb-6">{category.description}</p>
                    )}
                    {categoryBooks.length > 0 ? (
                      <BookGrid books={categoryBooks} />
                    ) : (
                      <p className="text-gray-400">Nenhum livro cadastrado para esta categoria.</p>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;
