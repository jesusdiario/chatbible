
import { useEffect, useRef, useState, useCallback } from 'react';
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
  
  // Rastreador para controlar se a verificação já foi feita
  const [checkPerformed, setCheckPerformed] = useState(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Versão memoizada de checkSubscriptionWithCache para evitar recriação
  const checkSubscriptionWithCache = useCallback(async (force = false) => {
    if (!user) {
      console.log('[useSubscription] No user, skipping subscription check');
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        subscribed: false,
        subscriptionTier: 'Gratuito' 
      }));
      setCheckPerformed(true);
      return;
    }
    
    try {
      if (checkPerformed && !force) {
        console.log('[useSubscription] Check already performed, skipping');
        return;
      }
      
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
      setCheckPerformed(true);
      
      // After verification completes, update cache
      localStorage.setItem('user_subscription_status', state.subscribed ? 'subscribed' : 'free');
      if (state.subscriptionTier) {
        localStorage.setItem('user_subscription_tier', state.subscriptionTier);
      }
    } catch (error) {
      console.error('[useSubscription] Error checking subscription:', error);
      // Ensure we're not stuck in loading state
      setState(prev => ({ ...prev, isLoading: false }));
      setCheckPerformed(true);
    }
  }, [user, setState, checkSubscription, state.subscribed, state.subscriptionTier]);

  // Check subscription once when component mounts or user changes
  useEffect(() => {
    console.log('[useSubscription] Initializing with user:', !!user);
    
    // Limpa timeout anterior se existir
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    // Define o estado como não verificado quando o usuário muda
    if (user) {
      setCheckPerformed(false);
      checkSubscriptionWithCache();
    } else {
      // Quando não há usuário, apenas definimos o estado como não assinante
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        subscribed: false,
        subscriptionTier: 'Gratuito' 
      }));
      setCheckPerformed(true);
    }
    
    // Re-check subscription every 10 minutes, mas somente se houver um usuário
    let interval: NodeJS.Timeout;
    if (user) {
      interval = setInterval(() => {
        console.log('[useSubscription] Performing periodic subscription check');
        checkSubscriptionWithCache(true); // force=true para ignorar o checkPerformed
      }, 10 * 60 * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [user, setState, checkSubscriptionWithCache]);

  return {
    ...state,
    isLoading: state.isLoading || isProcessing,
    plans,
    checkSubscription: () => checkSubscriptionWithCache(true), // Sempre força uma nova verificação
    startCheckout,
    openCustomerPortal,
    refreshSubscription: () => {
      console.log("[useSubscription] Refreshing subscription data");
      return checkSubscriptionWithCache(true); // Força uma nova verificação
    },
    isProcessing
  };
};
