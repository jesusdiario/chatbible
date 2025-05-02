
import React from 'react';
import { Link } from 'react-router-dom';
import { Book, ChevronLeft, Home } from 'lucide-react';

const Biblia1BottomNav: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-around max-w-md mx-auto">
        <Link to="/" className="flex flex-col items-center text-gray-600">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Início</span>
        </Link>
        <Link to="/biblia" className="flex flex-col items-center text-blue-600">
          <Book className="h-6 w-6" />
          <span className="text-xs mt-1">Bíblia</span>
        </Link>
        <Link to="/livros-da-biblia" className="flex flex-col items-center text-gray-600">
          <ChevronLeft className="h-6 w-6" />
          <span className="text-xs mt-1">Voltar</span>
        </Link>
      </div>
    </div>
  );
};

export default Biblia1BottomNav;
