
import React, { useState } from 'react';
import { BibleReader } from '../components/BibleReader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';

// Cliente de consulta para reagir a consultas
const queryClient = new QueryClient();

const BibleReaderPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
        <div className="flex-1">
          <BibleReader />
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default BibleReaderPage;
