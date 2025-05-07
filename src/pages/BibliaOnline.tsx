
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import BibleReaderPage from '../biblia-online/pages/BibleReaderPage';
import LivrosDaBibliaBook from './LivrosDaBibliaBook';
import Sidebar from '../components/Sidebar';
import { useSidebarControl } from '../hooks/useSidebarControl';

const BibliaOnline: React.FC = () => {
  const { isSidebarOpen, toggleSidebar, setIsSidebarOpen } = useSidebarControl();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        <Routes>
          <Route path="/" element={<BibleReaderPage isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} />
          <Route path="/livros-da-biblia/:book/:slug?" element={<LivrosDaBibliaBook />} />
        </Routes>
      </div>
    </div>
  );
};

export default BibliaOnline;
