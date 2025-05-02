
import React from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useBibleData } from "@/hooks/useBibleData";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { BibleCategorySection } from "@/components/BibleCategorySection";
import { useTranslation } from "react-i18next";
import { BibleCategory } from "@/types/bible";

const ErrorState: React.FC<{ error: any; isSidebarOpen: boolean; onToggleSidebar: () => void }> = ({
  error, isSidebarOpen, onToggleSidebar
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={onToggleSidebar} 
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-dark min-h-screen">
          <div className="p-4 bg-red-900 rounded">
            <p className="font-bold">{t('errors.general')}:</p>
            <pre className="mt-2 overflow-auto text-sm">{JSON.stringify(error, null, 2)}</pre>
          </div>
        </div>
      </main>
    </div>
  );
};

const LoadingState: React.FC<{ isSidebarOpen: boolean; onToggleSidebar: () => void }> = ({
  isSidebarOpen, onToggleSidebar
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={onToggleSidebar} 
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-black min-h-screen flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </main>
    </div>
  );
};

const CategoriesList: React.FC<{
  categories: BibleCategory[]; booksByCategory: Record<string, any[]>;
}> = ({ categories, booksByCategory }) => (
  <div className="max-w-7xl mx-auto space-y-12">
    {Array.isArray(categories) && categories.map(category => {
      const categoryBooks = booksByCategory[category.slug] || [];
      return (
        <BibleCategorySection key={category.slug} category={category} books={categoryBooks} />
      );
    })}
  </div>
);

const LivrosDaBiblia = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const { categories, booksByCategory, isLoading, isError, error } = useBibleData();
  const { t } = useTranslation();

  if (isError) {
    return <ErrorState error={error} isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />;
  }

  if (isLoading) {
    return <LoadingState isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar} 
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-dark min-h-screen">
          <CategoriesList categories={Array.isArray(categories) ? categories : []} booksByCategory={booksByCategory} />
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;
