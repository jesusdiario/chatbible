
import React from 'react';
import { Book, Home, Search, PlusCircle, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

const BibliaBottomNav: React.FC<{ active: 'home' | 'biblia' | 'planos' | 'descubra' | 'mais' }> = ({ active }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-between py-1">
      <Link to="/" className={`flex flex-col items-center p-2 ${active === 'home' ? 'text-blue-600' : 'text-gray-600'}`}>
        <Home size={20} />
        <span className="text-xs mt-1">Início</span>
      </Link>
      <Link to="/biblia" className={`flex flex-col items-center p-2 ${active === 'biblia' ? 'text-blue-600' : 'text-gray-600'}`}>
        <Book size={20} />
        <span className="text-xs mt-1">Bíblia</span>
      </Link>
      <Link to="/planos" className={`flex flex-col items-center p-2 ${active === 'planos' ? 'text-blue-600' : 'text-gray-600'}`}>
        <PlusCircle size={20} />
        <span className="text-xs mt-1">Planos</span>
      </Link>
      <Link to="/descubra" className={`flex flex-col items-center p-2 ${active === 'descubra' ? 'text-blue-600' : 'text-gray-600'}`}>
        <Search size={20} />
        <span className="text-xs mt-1">Descubra</span>
      </Link>
      <Link to="/mais" className={`flex flex-col items-center p-2 ${active === 'mais' ? 'text-blue-600' : 'text-gray-600'}`}>
        <Menu size={20} />
        <span className="text-xs mt-1">Mais</span>
      </Link>
    </div>
  );
};

export default BibliaBottomNav;
