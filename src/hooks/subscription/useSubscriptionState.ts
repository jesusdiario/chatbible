
import { useState } from 'react';
import { SubscriptionState } from './types';

export const useSubscriptionState = () => {
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    subscribed: false,
    subscriptionTier: null,
    subscriptionEnd: null,
    messageLimit: 10, // Padrão para plano gratuito
    plan: null,
    subscription_data: null
  });

  return { state, setState };
};
