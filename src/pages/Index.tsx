
import React from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useBibleData } from "@/hooks/useBibleData";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { BibleCategorySection } from "@/components/BibleCategorySection";
import { useChatState } from "@/hooks/useChatState";
import ChatHistoryList from "@/components/ChatHistoryList";
import { categorizeChatHistory } from "@/types/chat";

const ErrorState: React.FC<{ error: any; isSidebarOpen: boolean; onToggleSidebar: () => void; onApiKeyChange: (k: string) => void }> = ({
  error, isSidebarOpen, onToggleSidebar, onApiKeyChange
}) => (
  <div className="flex flex-col md:flex-row h-screen">
    <Sidebar isOpen={isSidebarOpen} onToggle={onToggleSidebar} onApiKeyChange={onApiKeyChange} />
    <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
      <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
      <div className="pt-[60px] pb-4 px-4 md:px-8 bg-background text-[#000000] min-h-screen">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-800">
          <p className="font-medium">Falha ao carregar dados:</p>
          <pre className="mt-2 overflow-auto text-sm bg-white p-4 rounded-md">{JSON.stringify(error, null, 2)}</pre>
        </div>
      </div>
    </main>
  </div>
);

const LoadingState: React.FC<{ isSidebarOpen: boolean; onToggleSidebar: () => void; onApiKeyChange: (k: string) => void }> = ({
  isSidebarOpen, onToggleSidebar, onApiKeyChange
}) => (
  <div className="flex flex-col md:flex-row h-screen">
    <Sidebar isOpen={isSidebarOpen} onToggle={onToggleSidebar} onApiKeyChange={onApiKeyChange} />
    <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
      <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
      <div className="pt-[60px] pb-4 px-4 md:px-8 bg-background text-[#000000] min-h-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    </main>
  </div>
);

const CategoriesList: React.FC<{
  categories: any[]; booksByCategory: Record<string, any[]>;
}> = ({ categories, booksByCategory }) => (
  <div className="max-w-7xl mx-auto space-y-12">
    {categories.map(category => {
      const categoryBooks = booksByCategory[category.slug] || [];
      return (
        <BibleCategorySection key={category.slug} category={category} books={categoryBooks} />
      );
    })}
  </div>
);

const LivrosDaBiblia = () => {
  const { isSidebarOpen, setApiKey, toggleSidebar } = useSidebarControl();
  const { categories, booksByCategory, isLoading, isError, error } = useBibleData();
  const { chatHistory } = useChatState();

  if (isError) {
    return <ErrorState error={error} isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} onApiKeyChange={setApiKey} />;
  }

  if (isLoading) {
    return <LoadingState isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} onApiKeyChange={setApiKey} />;
  }

  // Processamos o histórico de chat usando a função categorizeChatHistory
  const timeframedHistory = categorizeChatHistory(chatHistory);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onApiKeyChange={setApiKey} />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-background text-dark min-h-screen">
          <div className="max-w-7xl mx-auto py-6">
            <h1 className="text-dark font-semibold text-center mb-8"></h1>
            
            {chatHistory && chatHistory.length > 0 && (
              <div className="mb-12">
                <ChatHistoryList chatHistory={timeframedHistory} />
              </div>
            )}
            
            <CategoriesList categories={categories} booksByCategory={booksByCategory} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;
