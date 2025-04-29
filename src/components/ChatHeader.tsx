
import React from 'react';
import { Menu, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  title
}) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 z-10 w-full bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            className="md:hidden"
          >
            {isSidebarOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Título centralizado "BibleChat" */}
        <div className="absolute left-1/2 transform -translate-x-1/2 font-semibold text-lg">
          BibleChat
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="hidden md:flex"
            onClick={() => navigate('/chat/new')}
          >
            Nova conversa
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
