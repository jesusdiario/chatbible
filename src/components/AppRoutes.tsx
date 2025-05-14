
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import Auth from '@/pages/Auth';
import ChatPage from '@/pages/ChatPage';
import ChatHistory from '@/pages/ChatHistory';
import BibliaOnline from '@/pages/BibliaOnline';
import Onboarding from '@/pages/Onboarding';
import AdminPages from '@/pages/AdminPages';
import Admin from '@/pages/Admin';
import AdminBooks from '@/pages/AdminBooks';
import NotFound from '@/pages/NotFound';
import PaymentSuccess from '@/pages/PaymentSuccess';
import Profile from '@/pages/Profile';
import Register from '@/pages/Register';
import LivrosDaBiblia from '@/pages/LivrosDaBiblia';
import LivrosDaBibliaBook from '@/pages/LivrosDaBibliaBook';
import TemasDaBiblia from '@/pages/TemasDaBiblia';
import TeologiaCrista from '@/pages/TeologiaCrista';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const AppRoutes = () => {
  const auth = useAuth();
  
  // Check if the user is authenticated and loading state
  const userAuthenticated = auth?.user !== null;
  const authLoading = auth?.loading || false;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/lp" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/register" element={<Register />} />
      <Route path="/biblia-online/*" element={<BibliaOnline />} />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat/:id" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/history" 
        element={
          <ProtectedRoute>
            <ChatHistory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/onboarding" 
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/pages" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPages />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/books" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminBooks />
          </ProtectedRoute>
        } 
      />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/livros-da-biblia" element={<LivrosDaBiblia />} />
      <Route path="/livros-da-biblia/:book" element={<LivrosDaBibliaBook />} />
      <Route path="/temas-da-biblia" element={<TemasDaBiblia />} />
      <Route path="/teologia-crista" element={<TeologiaCrista />} />
      <Route path="/contato" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
