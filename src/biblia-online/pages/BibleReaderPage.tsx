
import React from 'react';
import { BibleReader } from '../components/BibleReader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSidebarControl } from '@/hooks/useSidebarControl';

// Cliente de consulta para reagir a consultas
const queryClient = new QueryClient();

const BibleReaderPage: React.FC = () => {
  // No need to create new sidebar control, it's shared across the app
  
  return (
    <QueryClientProvider client={queryClient}>
      <BibleReader />
    </QueryClientProvider>
  );
};

export default BibleReaderPage;
