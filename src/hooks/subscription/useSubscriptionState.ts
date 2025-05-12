
import { useState } from 'react';
import { UserSubscription } from '@/types/subscription';

export const useSubscriptionState = () => {
  // Use uma versão inicial com isLoading: false para evitar triggers desnecessários
  const [state, setState] = useState<UserSubscription>({
    subscribed: false,
    subscriptionTier: "Gratuito",
    subscriptionEnd: null,
    messageLimit: 10, // Default for free plan
    plan: null,
    isLoading: false // Começamos com loading false e só ativamos quando necessário
  });

  return { state, setState };
};
