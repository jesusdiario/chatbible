
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BibleReaderPage from '../biblia-online/pages/BibleReaderPage';
import LivrosDaBibliaBook from './LivrosDaBibliaBook';
import Sidebar from "@/components/Sidebar";
import { useSidebarControl } from "@/hooks/useSidebarControl";

const BibliaOnline: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={toggleSidebar}
        currentPath="/biblia-online"
      />
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <Routes>
          <Route path="/" element={<BibleReaderPage />} />
          <Route path="/livros-da-biblia/:book/:slug?" element={<LivrosDaBibliaBook />} />
        </Routes>
      </div>
    </div>
  );
};

export default BibliaOnline;
