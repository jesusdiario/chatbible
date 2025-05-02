
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Book, Clipboard, Search, Menu } from 'lucide-react';

const Biblia1BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determinar qual rota está ativa
  const isHome = location.pathname === '/';
  const isBiblia = location.pathname.startsWith('/biblia');
  const isPlans = location.pathname.startsWith('/planos'); // Futura implementação
  const isSearch = location.pathname.startsWith('/busca'); // Futura implementação
  const isMenu = location.pathname === '/menu'; // Futura implementação
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 shadow-md z-10">
      <NavItem 
        icon={<Home className="h-6 w-6" />} 
        label="Início" 
        active={isHome} 
        onClick={() => navigate('/')} 
      />
      <NavItem 
        icon={<Book className="h-6 w-6" />} 
        label="Bíblia" 
        active={isBiblia} 
        onClick={() => navigate('/biblia')} 
      />
      <NavItem 
        icon={<Clipboard className="h-6 w-6" />} 
        label="Planos" 
        active={isPlans} 
        onClick={() => {}} // Será implementado no futuro
      />
      <NavItem 
        icon={<Search className="h-6 w-6" />} 
        label="Busca" 
        active={isSearch} 
        onClick={() => {}} // Será implementado no futuro
      />
      <NavItem 
        icon={<Menu className="h-6 w-6" />} 
        label="Mais" 
        active={isMenu} 
        onClick={() => {}} // Será implementado no futuro
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
      className={`flex flex-col items-center justify-center px-2 ${
        active ? 'text-blue-600' : 'text-gray-500'
      }`}
      onClick={onClick}
    >
      <div className={`${active ? 'scale-110' : ''} transition-transform`}>
        {icon}
      </div>
      <span className={`text-xs mt-1 ${active ? 'font-medium' : ''}`}>{label}</span>
    </button>
  );
};

export default Biblia1BottomNav;
