
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  message_limit: number;
  features: string[];
  price_amount: number;
  price_currency: string;
  stripe_price_id: string;
}

export interface SubscriptionState {
  isLoading: boolean;
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: Date | null;
  messageLimit: number;
  plan: SubscriptionPlan | null;
  subscription_data: any;
}
