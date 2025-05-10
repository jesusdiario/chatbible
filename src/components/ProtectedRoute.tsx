
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  allowLimitedAccess?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresAuth = true,
  allowLimitedAccess = false
}) => {
  const { user, loading, subscriptionStatus, checkSubscriptionStatus } = useAuth();
  const location = useLocation();
  
  // Paths that should always be accessible even if the user has exceeded their limit
  const alwaysAccessiblePaths = ['/profile', '/payment-success', '/auth'];
  const isAlwaysAccessible = alwaysAccessiblePaths.some(path => location.pathname.startsWith(path));
  
  useEffect(() => {
    const verifySubscription = async () => {
      if (user && !loading) {
        await checkSubscriptionStatus();
      }
    };
    
    verifySubscription();
  }, [user, loading, checkSubscriptionStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If authentication is required and user isn't logged in, redirect to auth
  if (requiresAuth && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Check if the free user has exceeded message limit and redirect if needed
  // Only redirect if:
  // 1. The route doesn't explicitly allow limited access
  // 2. The path isn't in the alwaysAccessiblePaths list
  // 3. The user has exceeded their limit and isn't subscribed
  // 4. We're not already on the limit exceeded page
  if (
    !allowLimitedAccess &&
    !isAlwaysAccessible &&
    subscriptionStatus.limitExceeded &&
    !subscriptionStatus.isSubscribed &&
    location.pathname !== '/limit-exceeded'
  ) {
    return <Navigate to="/limit-exceeded" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
