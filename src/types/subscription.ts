
export interface PricePlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  message_limit: number;
  features: string[];
  price_cents: number;
  currency: string;
  period: string;
}

export interface StripeItem {
  price_plan_id: string;
  stripe_price_id: string;
}

export interface Customer {
  user_id: string;
  email: string;
  stripe_customer_id: string | null;
  current_plan_id: string | null;
  current_status: string;
  current_period_end: Date | null;
}

export interface Usage {
  user_id: string;
  msgs_used: number;
  message_limit: number;
}

export interface SubscriptionState {
  isLoading: boolean;
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: Date | null;
  messageLimit: number;
  plan: PricePlan | null;
  canSendMessage: boolean;
  usedMessages: number;
  customer: Customer | null;
}
