
import React from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useBibleData } from "@/hooks/useBibleData";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { BibleCategorySection } from "@/components/BibleCategorySection";

const ErrorState: React.FC<{ error: any; isSidebarOpen: boolean; onToggleSidebar: () => void; onApiKeyChange: (k: string) => void }> = ({
  error, isSidebarOpen, onToggleSidebar, onApiKeyChange
}) => (
  <div className="flex flex-col md:flex-row h-screen">
    <Sidebar isOpen={isSidebarOpen} onToggle={onToggleSidebar} onApiKeyChange={onApiKeyChange} />
    <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
      <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
      <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-dark min-h-screen">
        <div className="p-4 bg-red-900 rounded">
          <p className="font-bold">Falha ao carregar dados:</p>
          <pre className="mt-2 overflow-auto text-sm">{JSON.stringify(error, null, 2)}</pre>
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
      <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-black min-h-screen flex justify-center items-center">
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

  if (isError) {
    return <ErrorState error={error} isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} onApiKeyChange={setApiKey} />;
  }

  if (isLoading) {
    return <LoadingState isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} onApiKeyChange={setApiKey} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onApiKeyChange={setApiKey} />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-dark min-h-screen">
          <CategoriesList categories={categories} booksByCategory={booksByCategory} />
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;