
import React from 'react';
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';

interface ChatPageLayoutProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  title?: string;
  children: React.ReactNode;
}

const ChatPageLayout: React.FC<ChatPageLayoutProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  title,
  children
}) => {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={onToggleSidebar}
        currentPath={window.location.pathname}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={onToggleSidebar} 
          title={title}
        />
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ChatPageLayout;
