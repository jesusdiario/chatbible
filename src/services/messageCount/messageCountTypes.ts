
/**
 * Types related to message counting functionality
 */

export interface MessageCountState {
  count: number;
  limit: number;
  lastReset: Date;
  nextReset: Date;
  percentUsed: number;
  canSendMessage: boolean;
  daysUntilReset: number;
}

// Mapping of subscription plans to their message limits
export const MESSAGE_LIMITS = {
  FREE: 10,
  STANDARD: 50,
  PREMIUM: 200
};
