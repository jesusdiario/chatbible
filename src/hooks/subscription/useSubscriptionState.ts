
import { useState } from 'react';
import { UserSubscription } from '@/types/subscription';

export const useSubscriptionState = () => {
  const [state, setState] = useState<UserSubscription>({
    subscribed: false,
    subscriptionTier: "Gratuito",
    subscriptionEnd: null,
    messageLimit: 10, // Default for free plan
    plan: null,
    isLoading: true // Start with loading state
  });

  return { state, setState };
};
