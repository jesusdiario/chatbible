
import React from 'react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';

interface LoadingStateProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onApiKeyChange: (key: string) => void;
}

const LoadingState = ({ isSidebarOpen, onToggleSidebar, onApiKeyChange }: LoadingStateProps) => {
  return (
    <div className="flex h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={onToggleSidebar} 
        onApiKeyChange={onApiKeyChange}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={onToggleSidebar}
        />
        <div className="pt-[60px] flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </main>
    </div>
  );
};

export default LoadingState;
