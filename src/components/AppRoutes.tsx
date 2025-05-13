import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Index from "@/pages/Index";
import LandingPage from "@/pages/LandingPage";
import Auth from "@/pages/Auth";
import Register from "@/pages/Register";
import ChatPage from "@/pages/ChatPage";
import ChatHistory from "@/pages/ChatHistory";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import LivrosDaBiblia from "@/pages/LivrosDaBiblia";
import LivrosDaBibliaBook from "@/pages/LivrosDaBibliaBook";
import BibliaOnline from "@/pages/BibliaOnline";
import TemasDaBiblia from "@/pages/TemasDaBiblia";
import TeologiaCrista from "@/pages/TeologiaCrista";
import Contato from "@/pages/contato";
import Lexicon from "@/pages/Lexicon";
import { useAuth } from "@/contexts/AuthContext";
import Admin from "@/pages/Admin";
import AdminBooks from "@/pages/AdminBooks";
import AdminPages from "@/pages/AdminPages";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AdminTranslation from "@/pages/AdminTranslation";

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !isLoading && location.pathname !== '/auth/login' && location.pathname !== '/auth/register') {
      setRedirectPath(location.pathname);
    }
  }, [isAuthenticated, isLoading, location.pathname]);

  if (redirectPath && !isAuthenticated && !isLoading) {
    return <Navigate to={`/auth/login?redirect=${redirectPath}`} replace />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/auth/:type" element={<Auth />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/chat/history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
      <Route path="/livros-da-biblia" element={<LivrosDaBiblia />} />
      <Route path="/livros-da-biblia/:book" element={<LivrosDaBibliaBook />} />
      <Route path="/biblia-online" element={<BibliaOnline />} />
      <Route path="/temas-da-biblia" element={<TemasDaBiblia />} />
      <Route path="/teologia-crista" element={<TeologiaCrista />} />
      <Route path="/contato" element={<Contato />} />
      <Route path="/lexicon" element={<ProtectedRoute><Lexicon /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/admin/books" element={<ProtectedRoute><AdminBooks /></ProtectedRoute>} />
      <Route path="/admin/pages" element={<ProtectedRoute><AdminPages /></ProtectedRoute>} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route 
        path="/admin/translation" 
        element={
          <ProtectedRoute>
            <AdminTranslation />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
