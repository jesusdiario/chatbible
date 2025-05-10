
import { useEffect } from 'react';
import { useSubscriptionState } from './subscription/useSubscriptionState';
import { useSubscriptionActions } from './subscription/useSubscriptionActions';
import { useSubscriptionPlans } from './subscription/useSubscriptionPlans';

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

  // Check subscription when component mounts, but use cached value when available
  useEffect(() => {
    const checkSubscriptionWithCache = async () => {
      // Tentar obter do localStorage primeiro
      const cachedSubscriptionStatus = localStorage.getItem('user_subscription_status');
      const cachedSubscriptionTier = localStorage.getItem('user_subscription_tier');
      
      if (cachedSubscriptionStatus) {
        // Se temos valores em cache, usá-los para evitar chamadas desnecessárias
        setState(prev => ({
          ...prev,
          subscribed: cachedSubscriptionStatus === 'subscribed',
          subscriptionTier: cachedSubscriptionTier || prev.subscriptionTier
        }));
        
        // Ainda assim, atualizar em background para garantir dados atualizados
        // mas sem bloquear a interface
        setTimeout(() => {
          checkSubscription().then(() => {
            // Após verificação, atualizar cache
            localStorage.setItem('user_subscription_status', state.subscribed ? 'subscribed' : 'free');
            if (state.subscriptionTier) {
              localStorage.setItem('user_subscription_tier', state.subscriptionTier);
            }
          });
        }, 3000); // Delay para evitar chamadas imediatas
      } else {
        // Se não temos cache, fazer verificação normal
        await checkSubscription();
        // E salvar em cache
        localStorage.setItem('user_subscription_status', state.subscribed ? 'subscribed' : 'free');
        if (state.subscriptionTier) {
          localStorage.setItem('user_subscription_tier', state.subscriptionTier);
        }
      }
    };
    
    checkSubscriptionWithCache();
  }, []);

  return {
    ...state,
    isLoading: isProcessing,
    plans,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    refreshSubscription,
    isProcessing
  };
};
