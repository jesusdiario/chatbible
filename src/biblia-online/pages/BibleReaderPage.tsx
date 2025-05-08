
import React from 'react';
import { BibleReader } from '../components/BibleReader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Cliente de consulta para reagir a consultas
const queryClient = new QueryClient();

const BibleReaderPage: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BibleReader />
    </QueryClientProvider>
  );
};

export default BibleReaderPage;
