
import { useState } from 'react';
import { UserSubscription } from '@/types/subscription';

export const useSubscriptionState = () => {
  const [state, setState] = useState<UserSubscription>({
    isLoading: false,
    subscribed: false,
    subscriptionTier: null,
    subscriptionEnd: null,
    messageLimit: 10, // Default for free plan
    plan: null
  });

  return { state, setState };
};
