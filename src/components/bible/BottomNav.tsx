
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, CheckSquare, Compass, Menu } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4">
      <div className="flex justify-between items-center max-w-lg mx-auto">
        <NavLink to="/" className="flex flex-col items-center text-gray-600 hover:text-gray-900">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Início</span>
        </NavLink>
        
        <NavLink 
          to="/biblia/books" 
          className={({isActive}) => `flex flex-col items-center ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <BookOpen className="h-6 w-6" />
          <span className="text-xs mt-1">Bíblia</span>
        </NavLink>
        
        <NavLink to="#" className="flex flex-col items-center text-gray-600 hover:text-gray-900">
          <CheckSquare className="h-6 w-6" />
          <span className="text-xs mt-1">Planos</span>
        </NavLink>
        
        <NavLink to="#" className="flex flex-col items-center text-gray-600 hover:text-gray-900">
          <Compass className="h-6 w-6" />
          <span className="text-xs mt-1">Descubra</span>
        </NavLink>
        
        <NavLink to="#" className="flex flex-col items-center text-gray-600 hover:text-gray-900">
          <Menu className="h-6 w-6" />
          <span className="text-xs mt-1">Mais</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
