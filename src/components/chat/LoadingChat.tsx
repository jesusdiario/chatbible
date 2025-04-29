
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingChatProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const LoadingChat: React.FC<LoadingChatProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  return (
    <div className="pt-20 h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  );
};

export default LoadingChat;
