
/**
 * Service for managing message counts and limits
 */
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MESSAGE_LIMITS, MessageCountState } from './messageCountTypes';
import { calculateDaysUntilDate, getNextMonthDate } from './messageCountUtils';
import { 
  getUserSubscriptionData, 
  getUserMessageCount,
  createMessageCount,
  updateMessageCount,
  resetMessageCount,
  buildMessageCountState
} from './messageCountRepository';

/**
 * Fetches the current message count for the user
 */
export const getMessageCount = async (): Promise<MessageCountState | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    const userId = session.user.id;
    
    // Get subscription and plan data
    const { subscriberData, planData } = await getUserSubscriptionData(userId);
    
    // Determine message limit based on subscription plan
    const messageLimit = planData?.message_limit || MESSAGE_LIMITS.FREE;
    
    // Get message count record
    const data = await getUserMessageCount(userId);
    
    if (!data) {
      // No record found, return default state
      const now = new Date();
      const nextReset = subscriberData?.subscription_end ? 
        new Date(subscriberData.subscription_end) : 
        getNextMonthDate(now);
      
      return buildMessageCountState(0, messageLimit, now, nextReset);
    }
    
    const lastResetTime = new Date(data.last_reset_time);
    const now = new Date();
    
    // Calculate next reset date based on subscription_end or default to next month
    const nextReset = subscriberData?.subscription_end 
      ? new Date(subscriberData.subscription_end) 
      : getNextMonthDate(now);
    
    return buildMessageCountState(
      data.count,
      messageLimit,
      lastResetTime,
      nextReset
    );
  } catch (err) {
    console.error("Error in getMessageCount:", err);
    return null;
  }
};

/**
 * Increments the message count for the user
 * Returns true if successful, false otherwise
 */
export const incrementMessageCount = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }
    
    const userId = session.user.id;
    
    // Get current count first to check limits
    const currentState = await getMessageCount();
    
    if (!currentState) {
      return false;
    }
    
    if (!currentState.canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens. Faça upgrade para o plano premium para enviar mais mensagens.",
        variant: "destructive",
      });
      return false;
    }
    
    // Get user's message count record
    const messageCountData = await getUserMessageCount(userId);

    if (messageCountData) {
      // Update existing record
      return await updateMessageCount(userId, messageCountData.count + 1);
    } else {
      // Create new record
      const result = await createMessageCount(userId, 1);
      return result !== null;
    }
  } catch (err) {
    console.error("Error in incrementMessageCount:", err);
    return false;
  }
};

/**
 * Reset message counts for a user
 */
export const resetUserMessageCount = async (userId: string): Promise<boolean> => {
  return await resetMessageCount(userId);
};
