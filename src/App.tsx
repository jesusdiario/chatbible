
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { detectReloadTriggers } from "@/utils/debugUtils";
import ErrorBoundary from "@/components/ErrorBoundary";

// Importação dos componentes de páginas
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Admin from "@/pages/Admin";
import AdminPages from "@/pages/AdminPages";
import AdminBooks from "@/pages/AdminBooks";
import LivrosDaBiblia from "@/pages/LivrosDaBiblia";
import LivrosDaBibliaBook from "@/pages/LivrosDaBibliaBook";
import Lexicon from "@/pages/Lexicon";
import Profile from "@/pages/Profile";
import ChatHistory from "@/pages/ChatHistory";
import ChatPage from "@/pages/ChatPage"; 
import LandingPage from "@/pages/LandingPage";

// Importação das páginas da Bíblia
import BibleRoot from "@/pages/bible/BibleRoot";
import BooksList from "@/pages/bible/BooksList";
import ChaptersGrid from "@/pages/bible/ChaptersGrid";
import Reader from "@/pages/bible/Reader";

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

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Enable debug tools in development
    if (import.meta.env.DEV) {
      try {
        detectReloadTriggers();
      } catch (err) {
        console.error('Failed to initialize debug utilities:', err);
      }
    }

    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Componente de proteção de rota
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900">Carregando...</div>;
    if (!session) return <Navigate to="/auth" replace />;
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={session ? <Navigate to="/" replace /> : <Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/admin/paginas" element={
                <ProtectedRoute>
                  <AdminPages />
                </ProtectedRoute>
              } />
              <Route path="/admin/livros" element={
                <ProtectedRoute>
                  <AdminBooks />
                </ProtectedRoute>
              } />
              <Route path="/livros-da-biblia" element={
                <ProtectedRoute>
                  <LivrosDaBiblia />
                </ProtectedRoute>
              } />
              <Route path="/livros-da-biblia/:book" element={
                <ProtectedRoute>
                  <LivrosDaBibliaBook />
                </ProtectedRoute>
              } />
              <Route path="/livros-da-biblia/:book/:slug" element={
                <ProtectedRoute>
                  <LivrosDaBibliaBook />
                </ProtectedRoute>
              } />
              <Route path="/chat/:slug" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <ChatHistory />
                </ProtectedRoute>
              } />
              <Route path="/lexicon" element={
                <ProtectedRoute>
                  <Lexicon />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              {/* Nova rota para a landing page */}
              <Route path="/lp" element={<LandingPage />} />
              
              {/* Novas rotas para a Bíblia */}
              <Route path="/biblia" element={<BibleRoot />}>
                <Route index element={<Navigate to="/biblia/books" replace />} />
                <Route path="books" element={<BooksList />} />
                <Route path="books/:id" element={<ChaptersGrid />} />
                <Route path="books/:id/:chapter" element={<Reader />} />
                <Route path="books/:id/:chapter/:verse" element={<Reader />} />
              </Route>
            </Routes>
          </TooltipProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
