
import React from 'react';
import Sidebar from "./Sidebar";
import ChatHeader from "./ChatHeader";
import ErrorBoundary from "./ErrorBoundary";

interface BookChatLayoutProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  children: React.ReactNode;
}

const BookChatLayout: React.FC<BookChatLayoutProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  children
}) => {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      <ErrorBoundary>
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={onToggleSidebar}
          currentPath={window.location.pathname}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'} min-h-screen`}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={onToggleSidebar}
          />
          {children}
        </main>
      </ErrorBoundary>
    </div>
  );
};

export default BookChatLayout;
