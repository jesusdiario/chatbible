
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
import Register from "@/pages/Register"; // Nova página de registro
import Onboarding from "@/pages/Onboarding"; // Nova página de onboarding
import Index from "@/pages/Index";
import Admin from "@/pages/Admin";
import AdminPages from "@/pages/AdminPages";
import AdminBooks from "@/pages/AdminBooks";
import LivrosDaBiblia from "@/pages/LivrosDaBiblia";
import LivrosDaBibliaBook from "@/pages/LivrosDaBibliaBook";
import TemasDaBiblia from "@/pages/TemasDaBiblia";
import TeologiaCrista from "@/pages/TeologiaCrista";
import Profile from "@/pages/Profile";
import ChatHistory from "@/pages/ChatHistory";
import ChatPage from "@/pages/ChatPage"; 
import LandingPage from "@/pages/LandingPage";
import Lexicon from "@/pages/Lexicon";
import BibliaOnline from "@/pages/BibliaOnline";

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
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session) {
        // Verificar se o onboarding foi concluído
        const { data } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
          
        setOnboardingComplete(data?.onboarding_completed || false);
      }
      
      setLoading(false);
    });

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event);
      setSession(session);
      
      if (session) {
        // Verificar se o onboarding foi concluído quando o estado de auth muda
        const { data } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
          
        setOnboardingComplete(data?.onboarding_completed || false);
      } else {
        setOnboardingComplete(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Componente de proteção de rota
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900">Carregando...</div>;
    if (!session) return <Navigate to="/auth" replace />;
    if (session && onboardingComplete === false) return <Navigate to="/onboarding" replace />;
    return <>{children}</>;
  };

  // Componente para gerenciar rotas de autenticação
  const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900">Carregando...</div>;
    if (session && onboardingComplete === true) return <Navigate to="/" replace />;
    if (session && onboardingComplete === false) return <Navigate to="/onboarding" replace />;
    return <>{children}</>;
  };
  
  // Componente para gerenciar rotas de onboarding
  const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900">Carregando...</div>;
    if (!session) return <Navigate to="/auth" replace />;
    if (session && onboardingComplete === true) return <Navigate to="/" replace />;
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
              <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
              <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
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
              <Route path="/temas-da-biblia" element={
                <ProtectedRoute>
                  <TemasDaBiblia />
                </ProtectedRoute>
              } />
              <Route path="/teologia-crista" element={
                <ProtectedRoute>
                  <TeologiaCrista />
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
              <Route path="/biblia-online" element={
                <ProtectedRoute>
                  <BibliaOnline />
                </ProtectedRoute>
              } />
              <Route path="/lp" element={<LandingPage />} />
            </Routes>
          </TooltipProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
