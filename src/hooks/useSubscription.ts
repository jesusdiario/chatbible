
import { useEffect } from 'react';
import { useSubscriptionState } from './subscription/useSubscriptionState';
import { useSubscriptionActions } from './subscription/useSubscriptionActions';
import { useSubscriptionPlans } from './subscription/useSubscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscription = () => {
  const { user } = useAuth();
  const { state, setState } = useSubscriptionState();
  const { 
    checkSubscription, 
    startCheckout, 
    openCustomerPortal,
    isProcessing,
    refreshSubscription
  } = useSubscriptionActions(setState);
  const plans = useSubscriptionPlans(state.subscriptionTier);
  
  // Update messageLimit when we have plans and subscription tier
  useEffect(() => {
    if (plans.length > 0 && state.subscriptionTier) {
      const currentPlan = plans.find(p => p.name === state.subscriptionTier);
      if (currentPlan) {
        setState(prev => ({
          ...prev,
          messageLimit: currentPlan.message_limit,
          plan: currentPlan
        }));
      }
    }
  }, [plans, state.subscriptionTier, setState]);

  // Check subscription when component mounts or user changes
  useEffect(() => {
    console.log('[useSubscription] Initializing with user:', !!user);
    
    if (!user) {
      console.log('[useSubscription] No user, skipping subscription check');
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        subscribed: false,
        subscriptionTier: 'Gratuito' 
      }));
      return;
    }
    
    const checkSubscriptionWithCache = async () => {
      try {
        // Try to get cached subscription status first
        const cachedSubscriptionStatus = localStorage.getItem('user_subscription_status');
        const cachedSubscriptionTier = localStorage.getItem('user_subscription_tier');
        
        console.log('[useSubscription] Cache check:', { 
          cachedStatus: cachedSubscriptionStatus,
          cachedTier: cachedSubscriptionTier
        });
        
        if (cachedSubscriptionStatus) {
          // Use cached values temporarily
          setState(prev => ({
            ...prev,
            isLoading: true, // Keep loading true while we verify in background
            subscribed: cachedSubscriptionStatus === 'subscribed',
            subscriptionTier: cachedSubscriptionTier || prev.subscriptionTier
          }));
        } else {
          setState(prev => ({ ...prev, isLoading: true }));
        }
        
        // Always check current subscription status
        await checkSubscription();
        
        // After verification completes, update cache
        localStorage.setItem('user_subscription_status', state.subscribed ? 'subscribed' : 'free');
        if (state.subscriptionTier) {
          localStorage.setItem('user_subscription_tier', state.subscriptionTier);
        }
      } catch (error) {
        console.error('[useSubscription] Error checking subscription:', error);
        // Ensure we're not stuck in loading state
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    checkSubscriptionWithCache();
    
    // Re-check subscription every 10 minutes
    const interval = setInterval(() => {
      if (user) {
        console.log('[useSubscription] Performing periodic subscription check');
        checkSubscriptionWithCache();
      }
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, setState, checkSubscription, state.subscribed, state.subscriptionTier]);

  return {
    ...state,
    isLoading: state.isLoading || isProcessing,
    plans,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    refreshSubscription,
    isProcessing
  };
};
