
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
  const { subscribed, isLoading: subscriptionLoading, checkSubscription } = useSubscription();
  const location = useLocation();

  // Public paths that don't require auth or subscription
  const publicPaths = ['/auth', '/register', '/lp', '/payment-success', '/payment-canceled'];
  const isPublicPath = publicPaths.includes(location.pathname);

  useEffect(() => {
    // Check subscription status if the user is authenticated
    if (user && requiresSubscription) {
      checkSubscription();
    }
  }, [user, requiresSubscription, checkSubscription]);

  if (loading || (user && requiresSubscription && subscriptionLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If we're on a public path, always render it
  if (isPublicPath) {
    return <>{children}</>;
  }

  // If authentication is required but user isn't logged in
  if (requiresAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // If subscription is required but user doesn't have one
  if (requiresAuth && requiresSubscription && !subscribed) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
