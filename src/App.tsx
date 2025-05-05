
import React from 'react';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import QueryClientProvider from "@/providers/QueryClientProvider";
import UIProvider from "@/providers/UIProvider";
import DebugProvider from "@/providers/DebugProvider";
import AppRoutes from "@/components/AppRoutes";
import { ToastProvider } from "@/components/ui/toast"; 
import { Toaster } from "@/components/ui/toaster";

const App = () => {
  return (
    <React.StrictMode>
      <DebugProvider>
        <QueryClientProvider>
          <ToastProvider>
            <Toaster />
            <AuthProvider>
              <BrowserRouter>
                <UIProvider>
                  <AppRoutes />
                </UIProvider>
              </BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </DebugProvider>
    </React.StrictMode>
  );
};

export default App;
