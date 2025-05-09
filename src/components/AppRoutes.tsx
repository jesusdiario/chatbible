
import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

// Page imports
import Auth from "@/pages/Auth";
import Register from "@/pages/Register";
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
import NotFound from "@/pages/NotFound";

// Protected Route component logic
const ProtectedRoute = ({ 
  children 
}: { 
  children: React.ReactNode
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <LoadingSpinner />
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  // If still loading auth state, show nothing
  if (loading) {
    return null;
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      
      {/* Payment Success page */}
      <Route path="/payment-success" element={<PaymentSuccess />} />
      
      {/* Protected routes */}
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
      
      {/* Public routes */}
      <Route path="/lp" element={<LandingPage />} />
      
      {/* 404 Route - must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
