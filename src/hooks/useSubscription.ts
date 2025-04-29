
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionState } from './subscription/useSubscriptionState';
import { useSubscriptionActions } from './subscription/useSubscriptionActions';
import { useSubscriptionPlans } from './subscription/useSubscriptionPlans';

export const useSubscription = () => {
  const { state, setState } = useSubscriptionState();
  const { checkSubscription, startCheckout, openCustomerPortal } = useSubscriptionActions(setState);
  const plans = useSubscriptionPlans(state.subscriptionTier);
  
  // Atualizar o messageLimit quando tiver os planos e subscription tier
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

  // Verificar assinatura quando componente montar
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

    // Configurar listener para mudanças de autenticação
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
          subscription_data: null
        });
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return {
    ...state,
    plans,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    refreshSubscription: checkSubscription
  };
};
