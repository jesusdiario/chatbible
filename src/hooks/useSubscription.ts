
import { useEffect, useRef } from 'react';
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
  const initialCheckDoneRef = useRef(false);
  
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

  // Check subscription when component mounts, but only once
  useEffect(() => {
    if (!initialCheckDoneRef.current) {
      checkSubscription();
      initialCheckDoneRef.current = true;
    }
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
