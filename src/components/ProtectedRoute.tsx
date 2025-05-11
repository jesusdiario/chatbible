
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  requiresSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true,
  requiresSubscription = true
}) => {
  const { user, loading } = useAuth();
  const { 
    subscribed, 
    isLoading: subscriptionLoading, 
    checkSubscription,
    subscriptionEnd
  } = useSubscription();
  const location = useLocation();

  // Lista de rotas públicas que não exigem autenticação ou assinatura
  const publicPaths = ['/auth', '/lp', '/payment-success', '/payment-canceled'];
  const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

  // Verificar se a assinatura ainda está válida
  const isSubscriptionValid = subscriptionEnd ? new Date(subscriptionEnd) > new Date() : false;

  useEffect(() => {
    // Verificar status da assinatura se o usuário estiver autenticado
    if (user && requiresSubscription) {
      checkSubscription();
    }
  }, [user, requiresSubscription, checkSubscription]);

  // Exibir loading enquanto verifica autenticação e assinatura
  if (loading || (user && requiresSubscription && subscriptionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Se estivermos em uma rota pública, sempre renderizá-la
  if (isPublicPath) {
    return <>{children}</>;
  }

  // Se a autenticação for necessária mas o usuário não estiver logado
  if (requiresAuth && !user) {
    console.log("Usuário não autenticado, redirecionando para /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Se uma assinatura for necessária, mas o usuário não tiver uma ou ela estiver expirada
  if (requiresAuth && requiresSubscription && (!subscribed || !isSubscriptionValid)) {
    console.log("Usuário sem assinatura válida, redirecionando para /auth");
    return <Navigate to="/auth" state={{ noSubscription: true }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
