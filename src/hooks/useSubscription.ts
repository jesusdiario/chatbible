
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionState } from './subscription/useSubscriptionState';
import { useSubscriptionActions } from './subscription/useSubscriptionActions';
import { useSubscriptionPlans } from './subscription/useSubscriptionPlans';

export const useSubscription = () => {
  const { state, setState } = useSubscriptionState();
  const { checkSubscription, startCheckout, openCustomerPortal, trackUsage, isProcessing } = useSubscriptionActions(setState);
  const { plans, getStripePriceId } = useSubscriptionPlans(state.subscriptionTier);
  
  // Check subscription when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        checkSubscription();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    checkAuth();

    // Set up listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkSubscription();
      } else if (event === 'SIGNED_OUT') {
        setState({
          isLoading: false,
          subscribed: false,
          subscriptionTier: null,
          subscriptionEnd: null,
          messageLimit: 10,
          plan: null,
          canSendMessage: true,
          usedMessages: 0,
          customer: null
        });
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Helper method to get the Stripe ID for the plan code
  const getStripePriceIdByCode = (code: string) => {
    const plan = plans.find(p => p.code === code);
    return plan ? getStripePriceId(plan.id) : null;
  };

  return {
    ...state,
    plans,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    trackUsage,
    refreshSubscription: checkSubscription,
    isProcessing,
    getStripePriceId,
    getStripePriceIdByCode,
  };
};
