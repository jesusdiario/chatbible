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
import { AuthProvider } from "@/contexts/AuthContext";

// Importação dos componentes de páginas
import Auth from "@/pages/Auth";
import Register from "@/pages/Register";
import Onboarding from "@/pages/Onboarding";
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
import PaymentSuccess from "@/pages/PaymentSuccess";

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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

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
      
      if (session?.user) {
        // Buscar informações de perfil do usuário
        fetchUserProfile(session.user.id);
      } else {
        setProfileLoading(false);
      }
      
      setLoading(false);
    });

    // Ouvir mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
      
      setUserProfile(data || null);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Componente de proteção de rota
  const ProtectedRoute = ({ children, requiresOnboarding = true }: { children: React.ReactNode, requiresOnboarding?: boolean }) => {
    if (loading || profileLoading) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-100">Carregando...</div>;
    }
    
    if (!session) {
      return <Navigate to="/auth" replace />;
    }
    
    // Se o perfil existe, verifica se precisa completar o onboarding
    if (requiresOnboarding && userProfile && !userProfile.onboarding_completed) {
      const nextStep = userProfile.onboarding_step || 1;
      return <Navigate to={`/onboarding/${nextStep}`} replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Rotas de autenticação separadas */}
                <Route path="/auth" element={session ? <Navigate to="/" replace /> : <Auth />} />
                <Route path="/register" element={session ? <Navigate to="/" replace /> : <Register />} />
                <Route path="/onboarding/:step" element={
                  !session ? <Navigate to="/auth" replace /> : <Onboarding />
                } />
                
                {/* Nova rota para página de pagamento bem-sucedido */}
                <Route path="/payment-success" element={<PaymentSuccess />} />
                
                {/* Demais rotas */}
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
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
