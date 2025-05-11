
import { useEffect } from 'react';
import { useSubscriptionState } from './subscription/useSubscriptionState';
import { useSubscriptionActions } from './subscription/useSubscriptionActions';
import { useSubscriptionPlans } from './subscription/useSubscriptionPlans';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscription = () => {
  const { state, setState } = useSubscriptionState();
  const { 
    checkSubscription, 
    startCheckout, 
    openCustomerPortal,
    isProcessing,
    refreshSubscription
  } = useSubscriptionActions(setState);
  const plans = useSubscriptionPlans(state.subscriptionTier);
  const { user } = useAuth();
  
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
    const checkSubscriptionWithCache = async () => {
      if (!user) {
        setState(prev => ({
          ...prev,
          subscribed: false,
          subscriptionTier: null,
          subscriptionEnd: null
        }));
        return;
      }
      
      // Tentar obter do localStorage primeiro
      const cachedSubscriptionStatus = localStorage.getItem(`user_subscription_status_${user.id}`);
      const cachedSubscriptionTier = localStorage.getItem(`user_subscription_tier_${user.id}`);
      const cachedSubscriptionEnd = localStorage.getItem(`subscription_end_${user.id}`);
      
      if (cachedSubscriptionStatus) {
        // Se temos valores em cache, usá-los para evitar chamadas desnecessárias
        setState(prev => ({
          ...prev,
          subscribed: cachedSubscriptionStatus === 'subscribed',
          subscriptionTier: cachedSubscriptionTier || prev.subscriptionTier,
          subscriptionEnd: cachedSubscriptionEnd ? new Date(cachedSubscriptionEnd) : prev.subscriptionEnd
        }));
      }
      
      // Sempre atualizar em background para garantir dados atualizados
      const isActive = await checkSubscription();
      
      // Após verificação, atualizar cache
      if (user?.id) {
        localStorage.setItem(`user_subscription_status_${user.id}`, state.subscribed ? 'subscribed' : 'free');
        if (state.subscriptionTier) {
          localStorage.setItem(`user_subscription_tier_${user.id}`, state.subscriptionTier);
        }
        if (state.subscriptionEnd) {
          localStorage.setItem(`subscription_end_${user.id}`, state.subscriptionEnd.toISOString());
        }
      }
      
      return isActive;
    };
    
    if (user) {
      checkSubscriptionWithCache();
    }
  }, [user, checkSubscription, setState]);

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
