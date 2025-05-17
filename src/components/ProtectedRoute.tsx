
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import SubscriptionCheck from '@/components/SubscriptionCheck';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (requiresAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Adiciona verificação de assinatura apenas para usuários autenticados
  if (requiresAuth && user) {
    return <SubscriptionCheck>{children}</SubscriptionCheck>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
