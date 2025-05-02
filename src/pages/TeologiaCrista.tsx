
import React from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useBibleData } from "@/hooks/useBibleData";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { useTranslation } from "react-i18next";
import { BookGrid } from "@/components/BookGrid";

const ErrorState: React.FC<{ error: any; isSidebarOpen: boolean; onToggleSidebar: () => void }> = ({
  error, isSidebarOpen, onToggleSidebar
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={onToggleSidebar}
        currentPath={window.location.pathname}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
        <div className="pt-20 pb-6 px-4 bg-chatgpt-main text-dark min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-200">
              <p className="font-bold">{t('errors.general')}</p>
              <pre className="mt-2 overflow-auto text-sm">{JSON.stringify(error, null, 2)}</pre>
            </div>
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
        currentPath={window.location.pathname}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
        <div className="pt-20 pb-6 px-4 bg-chatgpt-main text-black min-h-screen">
          <div className="max-w-7xl mx-auto flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </main>
    </div>
  );
};

const TeologiaCrista = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const { books, isLoading, isError, error } = useBibleData();
  const { t } = useTranslation();

  if (isError) {
    return <ErrorState error={error} isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />;
  }

  if (isLoading) {
    return <LoadingState isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />;
  }

  // Filtrar apenas os livros com categoria "teologia"
  const teologiaBooks = books.filter(book => book.category_slug === "teologia");

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        currentPath={window.location.pathname}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-20 pb-6 px-4 bg-gray-50 text-dark min-h-screen">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Teologia Cristã</h1>
            <p className="text-gray-600 text-center mb-12">Explore os fundamentos da doutrina e teologia cristã</p>
            
            {teologiaBooks.length > 0 ? (
              <BookGrid books={teologiaBooks} />
            ) : (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="text-gray-600">Nenhum tema de teologia encontrado. Entre em contato com o administrador.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeologiaCrista;
