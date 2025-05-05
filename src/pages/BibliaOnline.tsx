
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BibleReaderPage from '../biblia-online/pages/BibleReaderPage';
import LivrosDaBibliaBook from './LivrosDaBibliaBook';

const BibliaOnline: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<BibleReaderPage />} />
        <Route path="/livros-da-biblia/:book/:slug?" element={<LivrosDaBibliaBook />} />
        <Route path="/versiculos/:slug?" element={<LivrosDaBibliaBook />} />
      </Routes>
    </div>
  );
};

export default BibliaOnline;
