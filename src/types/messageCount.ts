
export interface MessageCountState {
  count: number;
  limit: number;
  lastReset: Date;
  nextReset: Date;
  percentUsed: number;
  canSendMessage: boolean;
}

export interface MessageCountData {
  user_id: string;
  count: number;
  last_reset_time: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionPlan {
  name: string;
  message_limit: number;
}

// Default message limits by plan
export const MESSAGE_LIMITS = {
  FREE: 10,
  STANDARD: 50,
  PREMIUM: 200
};
