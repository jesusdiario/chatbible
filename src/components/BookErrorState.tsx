
import React from 'react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';

interface BookErrorStateProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const BookErrorState: React.FC<BookErrorStateProps> = ({
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <div className="flex h-screen flex-col">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={onToggleSidebar}
        chatHistory={[]}
        onChatSelect={() => {}}
        currentPath={window.location.pathname}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={onToggleSidebar}
        />
        <div className="pt-[60px] flex items-center justify-center min-h-[70vh] text-lg px-4">
          Livro não encontrado.
        </div>
      </main>
    </div>
  );
};

export default BookErrorState;
