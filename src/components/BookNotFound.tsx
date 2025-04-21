
import React from 'react';
import Sidebar from './Sidebar';
import ChatHeader from './ChatHeader';

interface BookNotFoundProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onApiKeyChange: (key: string) => void;
}

const BookNotFound = ({ isSidebarOpen, onToggleSidebar, onApiKeyChange }: BookNotFoundProps) => {
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
        <div className="pt-[60px] flex items-center justify-center min-h-[70vh] text-lg">
          Livro não encontrado.
        </div>
      </main>
    </div>
  );
};

export default BookNotFound;
