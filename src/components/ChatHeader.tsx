
import React from 'react';
import { MenuSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
}

const ChatHeader = ({ 
  isSidebarOpen, 
  onToggleSidebar, 
  title 
}: ChatHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-10 px-4 h-16 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MenuSquare className="h-5 w-5" />
          )}
        </Button>
        <h1 className="text-lg font-semibold">
          {title || "JD Bible Chat"}
        </h1>
      </div>
    </div>
  );
};

export default ChatHeader;
