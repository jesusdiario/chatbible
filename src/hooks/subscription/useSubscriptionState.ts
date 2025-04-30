
import { useState } from 'react';
import { SubscriptionState } from '@/types/subscription';

export const useSubscriptionState = () => {
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    subscribed: false,
    subscriptionTier: null,
    subscriptionEnd: null,
    messageLimit: 10, // Default for free plan
    plan: null,
    canSendMessage: true,
    usedMessages: 0,
    customer: null
  });

  return { state, setState };
};
