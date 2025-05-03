
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Book, Bookmark, Search, Settings } from 'lucide-react';

const BibliaBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2">
      <NavItem 
        icon={<Home className="h-6 w-6" />} 
        label="Início" 
        active={location.pathname === '/'} 
        onClick={() => navigate('/')} 
      />
      <NavItem 
        icon={<Book className="h-6 w-6" />} 
        label="Bíblia" 
        active={location.pathname === '/biblia'} 
        onClick={() => navigate('/biblia')} 
      />
      <NavItem 
        icon={<Bookmark className="h-6 w-6" />} 
        label="Favoritos" 
        active={location.pathname === '/biblia/favoritos'} 
        onClick={() => navigate('/biblia/favoritos')} 
      />
      <NavItem 
        icon={<Search className="h-6 w-6" />} 
        label="Pesquisar" 
        active={location.pathname === '/biblia/pesquisar'} 
        onClick={() => navigate('/biblia/pesquisar')} 
      />
      <NavItem 
        icon={<Settings className="h-6 w-6" />} 
        label="Config" 
        active={location.pathname === '/biblia/configuracoes'} 
        onClick={() => navigate('/biblia/configuracoes')} 
      />
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button 
      className={`flex flex-col items-center justify-center ${active ? 'text-blue-600' : 'text-gray-500'}`}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

export default BibliaBottomNav;
