
import React from "react";
import { Book, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface NavigationSectionProps {
  currentPath?: string;
  onToggle?: () => void;
}

const NavigationSection: React.FC<NavigationSectionProps> = ({ currentPath, onToggle }) => {
  const navigate = useNavigate();
  
  const goToLivrosDaBiblia = () => {
    navigate('/livros-da-biblia');
    if (window.innerWidth < 768) {
      onToggle?.();
    }
  };

  const goToBibliaConsulta = () => {
    navigate('/biblia-consulta');
    if (window.innerWidth < 768) {
      onToggle?.();
    }
  };

  return (
    <div className="mb-6">
      <span className="text-sm text-gray-500 mb-2 block">Menu</span>
      <button 
        onClick={goToLivrosDaBiblia} 
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg", 
          currentPath === '/livros-da-biblia' ? "bg-gray-100" : "hover:bg-gray-50"
        )}
      >
        <Book className="h-5 w-5 text-gray-500" />
        <span>Livros da Bíblia</span>
      </button>
      
      <button 
        onClick={goToBibliaConsulta} 
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg mt-1", 
          currentPath === '/biblia-consulta' ? "bg-gray-100" : "hover:bg-gray-50"
        )}
      >
        <Search className="h-5 w-5 text-gray-500" />
        <span>Consulta Bíblica</span>
      </button>
    </div>
  );
};

export default NavigationSection;
