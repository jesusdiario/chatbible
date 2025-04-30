
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Auth from "@/pages/Auth";
import Index from '@/pages/Index';
import ChatPage from '@/pages/ChatPage';
import Profile from '@/pages/Profile';
import NotFound from "@/pages/NotFound";
import PaymentSuccess from '@/pages/PaymentSuccess';
// Add other pages as needed

import '@/i18n/i18n';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment-success" element={
            <ProtectedRoute>
              <PaymentSuccess />
            </ProtectedRoute>
          } />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          <Route path="/chat/:slug" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Wildcard/404 route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
      <Toaster />
    </Router>
  );
}

export default App;
