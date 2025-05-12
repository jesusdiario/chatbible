
import React, { useEffect, useState } from 'react';
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
  const { user, session, loading: authLoading } = useAuth();
  const { 
    subscribed, 
    isLoading: subscriptionLoading 
  } = useSubscription();
  const [subscriptionCheckTimeout, setSubscriptionCheckTimeout] = useState(false);
  const location = useLocation();
  
  // Public paths that don't require auth or subscription
  const publicPaths = ['/auth', '/register', '/lp', '/payment-success', '/payment-canceled'];
  const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

  console.log('[ProtectedRoute]', { 
    path: location.pathname, 
    isPublicPath, 
    user: !!user, 
    session: !!session,
    authLoading, 
    subscribed, 
    subscriptionLoading,
    subscriptionCheckTimeout
  });

  // Set timeout to bypass subscription verification after 3 seconds (reduzido de 5 para 3)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (user && requiresSubscription && subscriptionLoading) {
      console.log('[ProtectedRoute] Setting subscription check timeout');
      timer = setTimeout(() => {
        console.log('[ProtectedRoute] Subscription check timed out, allowing access');
        setSubscriptionCheckTimeout(true);
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user, requiresSubscription, subscriptionLoading]);

  // Show loading spinner during initial auth check
  if (authLoading) {
    console.log('[ProtectedRoute] Auth loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If we're on a public path, always render it
  if (isPublicPath) {
    console.log('[ProtectedRoute] Public path, allowing access');
    return <>{children}</>;
  }

  // If authentication is required but user isn't logged in
  if (requiresAuth && !user) {
    console.log('[ProtectedRoute] Auth required but no user, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // If still checking subscription and hasn't timed out yet, show loading
  if (requiresSubscription && subscriptionLoading && !subscriptionCheckTimeout && user) {
    console.log('[ProtectedRoute] Checking subscription status...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Se estamos aqui e o usuário está autenticado, permitimos o acesso
  // - Se a verificação de assinatura expirou (timeout)
  // - OU se o usuário está inscrito
  // - OU se não estamos exigindo assinatura
  const allowAccess = 
    (user && subscriptionCheckTimeout) || 
    (user && !requiresSubscription) || 
    (user && requiresSubscription && subscribed);
  
  // Se o acesso deve ser permitido
  if (allowAccess) {
    console.log('[ProtectedRoute] Access granted');
    return <>{children}</>;
  }
  
  // Caso contrário, redirecionamos para auth
  console.log('[ProtectedRoute] No subscription, redirecting to /auth');
  return <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
