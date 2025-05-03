
import React from "react";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { useTranslation } from "react-i18next";

const Lexicon = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const { t } = useTranslation();

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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              {t('lexicon.title', 'Léxico Bíblico')}
            </h1>
            <p className="text-gray-600 text-center mb-12">
              {t('lexicon.description', 'Explore os significados originais das palavras bíblicas em hebraico e grego.')}
            </p>
            
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <p className="text-center text-gray-500">
                {t('lexicon.comingSoon', 'Funcionalidade em desenvolvimento. Disponível em breve.')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lexicon;
