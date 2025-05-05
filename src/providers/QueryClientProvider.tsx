
import React from 'react';
import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";

// Configure the query client with settings to prevent unnecessary fetches
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetching data when window regains focus
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      retry: false, // Don't retry failed requests automatically
    },
  },
});

interface QueryClientProviderProps {
  children: React.ReactNode;
}

export const QueryClientProvider: React.FC<QueryClientProviderProps> = ({ children }) => {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
};

export default QueryClientProvider;
