
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryClientProvider from "@/providers/QueryClientProvider";
import UIProvider from "@/providers/UIProvider";
import DebugProvider from "@/providers/DebugProvider";
import AppRoutes from "@/components/AppRoutes";

const App = () => {
  return (
    <DebugProvider>
      <QueryClientProvider>
        <AuthProvider>
          <BrowserRouter>
            <UIProvider>
              <AppRoutes />
            </UIProvider>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </DebugProvider>
  );
};

export default App;
