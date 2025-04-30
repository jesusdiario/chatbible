
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
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: Date | null;
  message_limit: number;
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
