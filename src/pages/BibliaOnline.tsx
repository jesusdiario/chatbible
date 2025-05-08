
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import BibleReaderPage from '../biblia-online/pages/BibleReaderPage';
import LivrosDaBibliaBook from './LivrosDaBibliaBook';
import Sidebar from '@/components/Sidebar';

const BibliaOnline: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<BibleReaderPage />} />
          <Route path="/livros-da-biblia/:book/:slug?" element={<LivrosDaBibliaBook />} />
        </Routes>
      </div>
    </div>
  );
};

export default BibliaOnline;
