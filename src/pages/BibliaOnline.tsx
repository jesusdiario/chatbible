
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BibleReaderPage from '../biblia-online/pages/BibleReaderPage';

const BibliaOnline: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BibleReaderPage />
    </div>
  );
};

export default BibliaOnline;
