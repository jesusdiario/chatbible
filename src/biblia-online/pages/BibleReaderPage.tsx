
import React from 'react';
import { BibleReader } from '../components/BibleReader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Cliente de consulta para reagir a consultas
const queryClient = new QueryClient();

interface BibleReaderPageProps {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const BibleReaderPage: React.FC<BibleReaderPageProps> = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BibleReader isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </QueryClientProvider>
  );
};

export default BibleReaderPage;
