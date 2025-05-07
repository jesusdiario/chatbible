
import React from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useBibleData } from "@/hooks/useBibleData";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { useTranslation } from "react-i18next";
import { BookGrid } from "@/components/BookGrid";
import { BibleCategorySection } from "@/components/BibleCategorySection";

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
  const { categories, books, isLoading, isError, error } = useBibleData();
  const { t } = useTranslation();

  if (isError) {
    return <ErrorState error={error} isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />;
  }

  if (isLoading) {
    return <LoadingState isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />;
  }

  // Lista das categorias específicas de teologia que queremos mostrar
  const teologiaSlugs = [
    'doutrina-da-igreja',
    'doutrina-da-salvacao',
    'doutrina-das-escrituras',
    'doutrina-das-ultimas-coisas',
    'doutrina-de-cristo',
    'doutrina-de-deus',
    'doutrina-do-espirito-santo',
    'doutrina-do-homem',
    'doutrina-do-pecado'
  ];

  // Filtrar apenas as categorias de teologia específicas e ordenar pelo display_order
  const teologiaCategorias = categories
    .filter(category => teologiaSlugs.includes(category.slug))
    .sort((a, b) => a.display_order - b.display_order);

  // Organizar os livros por categoria
  const secoesPorCategoria = teologiaCategorias.map(categoria => {
    // Filtrar livros que pertencem a esta categoria
    const categoriaLivros = books.filter(book => book.category_slug === categoria.slug);
    // Ordená-los pelo display_order
    const livrosOrdenados = [...categoriaLivros].sort((a, b) => a.display_order - b.display_order);
    
    return (
      <BibleCategorySection
        key={categoria.slug}
        category={categoria}
        books={livrosOrdenados}
      />
    );
  });

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
            
            {secoesPorCategoria.length > 0 ? (
              <div className="space-y-16">
                {secoesPorCategoria}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-100 rounded-lg">
                <p className="text-gray-600">Nenhuma categoria de teologia encontrada. Entre em contato com o administrador.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeologiaCrista;
