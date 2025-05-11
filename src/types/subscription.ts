
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  message_limit: number;
  price_amount: number;
  price_currency: string;
  features: string[];
  stripe_price_id: string;
  is_active: boolean;
}

export interface UserSubscription {
  isLoading?: boolean;
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: Date | null;
  messageLimit: number;
  plan: SubscriptionPlan | null;
}

export interface MessageCountState {
  count: number;
  limit: number;
  lastReset: Date;
  nextReset: Date;
  percentUsed: number;
  canSendMessage: boolean;
  daysUntilReset: number;
}
