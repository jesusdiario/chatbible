
import React from 'react';
import { PlusIcon, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  isSidebarOpen: boolean;
  onNewChat: () => void;
  title?: string;
}

const ChatHeader = ({ isSidebarOpen, onNewChat, title = 'Chat' }: ChatHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-[60px] items-center justify-between border-b border-white/20 bg-slate-900 px-4">
      <div className="flex items-center gap-3">
        <Menu className={`h-6 w-6 cursor-pointer ${isSidebarOpen ? 'text-white/80' : 'text-white/40'}`} />
        <h1 className="text-lg font-medium">{title}</h1>
      </div>
      <Button variant="ghost" size="icon" onClick={onNewChat}>
        <PlusIcon className="h-6 w-6 text-white/80" />
      </Button>
    </header>
  );
};

export default ChatHeader;
