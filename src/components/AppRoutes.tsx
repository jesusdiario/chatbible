
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProtectedRoute from "@/components/ProtectedRoute";

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

export const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirect logic for authenticated users
  useEffect(() => {
    // If user is logged in and on the auth page, redirect to home
    if (user && location.pathname === "/auth") {
      console.log("[AppRoutes] User is logged in and on auth page, redirecting to home");
      navigate("/", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // If still loading auth state, show spinner
  if (loading) {
    console.log("[AppRoutes] Auth loading, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <LoadingSpinner />
      </div>
    );
  }

  console.log("[AppRoutes] Rendering routes, auth state:", { isAuthenticated: !!user });

  return (
    <Routes>
      {/* Public routes - no subscription required */}
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" replace /> : <Auth />} 
      />
      
      <Route path="/lp" element={<LandingPage />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-canceled" element={<LandingPage />} />
      
      {/* Protected routes - subscription required */}
      <Route path="/" element={
        <ProtectedRoute requiresSubscription={true}>
          <Index />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute requiresSubscription={true}>
          <Admin />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/paginas" element={
        <ProtectedRoute requiresSubscription={true}>
          <AdminPages />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/livros" element={
        <ProtectedRoute requiresSubscription={true}>
          <AdminBooks />
        </ProtectedRoute>
      } />
      
      <Route path="/livros-da-biblia" element={
        <ProtectedRoute requiresSubscription={true}>
          <LivrosDaBiblia />
        </ProtectedRoute>
      } />
      
      <Route path="/temas-da-biblia" element={
        <ProtectedRoute requiresSubscription={true}>
          <TemasDaBiblia />
        </ProtectedRoute>
      } />
      
      <Route path="/teologia-crista" element={
        <ProtectedRoute requiresSubscription={true}>
          <TeologiaCrista />
        </ProtectedRoute>
      } />
      
      <Route path="/livros-da-biblia/:book" element={
        <ProtectedRoute requiresSubscription={true}>
          <LivrosDaBibliaBook />
        </ProtectedRoute>
      } />
      
      <Route path="/livros-da-biblia/:book/:slug" element={
        <ProtectedRoute requiresSubscription={true}>
          <LivrosDaBibliaBook />
        </ProtectedRoute>
      } />
      
      <Route path="/chat/:slug" element={
        <ProtectedRoute requiresSubscription={true}>
          <ChatPage />
        </ProtectedRoute>
      } />
      
      <Route path="/history" element={
        <ProtectedRoute requiresSubscription={true}>
          <ChatHistory />
        </ProtectedRoute>
      } />
      
      <Route path="/lexicon" element={
        <ProtectedRoute requiresSubscription={true}>
          <Lexicon />
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute requiresSubscription={true}>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/biblia-online" element={
        <ProtectedRoute requiresSubscription={true}>
          <BibliaOnline />
        </ProtectedRoute>
      } />
      
      {/* 404 Route - must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
