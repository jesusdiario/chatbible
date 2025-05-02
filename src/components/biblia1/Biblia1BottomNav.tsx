
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Book, Clipboard, Search, Menu } from 'lucide-react';

const Biblia1BottomNav: React.FC = () => {
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
        icon={<Clipboard className="h-6 w-6" />} 
        label="Planos" 
        active={false} 
        onClick={() => {}} 
      />
      <NavItem 
        icon={<Search className="h-6 w-6" />} 
        label="Descubra" 
        active={false} 
        onClick={() => {}} 
      />
      <NavItem 
        icon={<Menu className="h-6 w-6" />} 
        label="Mais" 
        active={false} 
        onClick={() => {}} 
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

export default Biblia1BottomNav;
