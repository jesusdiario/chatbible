
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
    isLoading: subscriptionLoading, 
    checkSubscription 
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

  useEffect(() => {
    // Set timeout to bypass subscription verification after 5 seconds
    // to prevent users from getting stuck in loading state
    let timer: NodeJS.Timeout;
    
    if (user && requiresSubscription && subscriptionLoading) {
      timer = setTimeout(() => {
        console.log('[ProtectedRoute] Subscription check timed out, allowing access');
        setSubscriptionCheckTimeout(true);
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user, requiresSubscription, subscriptionLoading]);

  useEffect(() => {
    // Check subscription status if the user is authenticated
    if (user && requiresSubscription && !subscriptionLoading) {
      console.log('[ProtectedRoute] Checking subscription');
      checkSubscription().catch(err => {
        console.error('[ProtectedRoute] Error checking subscription:', err);
      });
    }
  }, [user, requiresSubscription, checkSubscription, subscriptionLoading]);

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
  if (requiresSubscription && subscriptionLoading && !subscriptionCheckTimeout) {
    console.log('[ProtectedRoute] Checking subscription status...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If subscription is required but user doesn't have one
  // Only apply this check if we've completed loading and timeout hasn't occurred
  if (requiresAuth && 
      requiresSubscription && 
      !subscribed && 
      !subscriptionLoading && 
      !subscriptionCheckTimeout) {
    console.log('[ProtectedRoute] No subscription, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Allow access if:
  // 1. User is authenticated (if required)
  // 2. User has subscription (if required) OR check timed out
  console.log('[ProtectedRoute] Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
