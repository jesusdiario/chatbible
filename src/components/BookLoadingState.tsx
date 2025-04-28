
import React from 'react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';
import LoadingSpinner from './LoadingSpinner';

interface BookLoadingStateProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const BookLoadingState: React.FC<BookLoadingStateProps> = ({
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <div className="flex h-screen flex-col">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={onToggleSidebar}
        onApiKeyChange={() => {}}
        chatHistory={[]}
        onChatSelect={() => {}}
        currentPath={window.location.pathname}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={onToggleSidebar}
        />
        <div className="pt-[60px] flex items-center justify-center min-h-[70vh]">
          <LoadingSpinner />
        </div>
      </main>
    </div>
  );
};

export default BookLoadingState;
