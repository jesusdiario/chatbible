
import React from 'react';
import { BibleReader } from '../components/BibleReader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSidebarControl } from '@/hooks/useSidebarControl';

// Cliente de consulta para reagir a consultas
const queryClient = new QueryClient();

const BibleReaderPage: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();

  return (
    <QueryClientProvider client={queryClient}>
      <BibleReader 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
    </QueryClientProvider>
  );
};

export default BibleReaderPage;
