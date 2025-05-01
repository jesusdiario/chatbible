import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Default message limits by plan
const MESSAGE_LIMITS = {
  FREE: 10,
  STANDARD: 50,
  PREMIUM: 200
};

export interface MessageCountState {
  count: number;
  limit: number;
  lastReset: Date;
  nextReset: Date;
  percentUsed: number;
  canSendMessage: boolean;
  daysUntilReset: number;
}

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

    // Get user's subscription info
    const { data: subscriberData } = await supabase
      .from('subscribers')
      .select('subscription_tier, subscribed, subscription_end')
      .eq('user_id', userId)
      .single();
    
    // Get user's message count
    const { data, error } = await supabase
      .from('message_counts')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching message count:", error);
      return null;
    }
    
    // Get subscription plan details
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', subscriberData?.subscription_tier || 'Gratuito')
      .single();
    
    const messageLimit = planData?.message_limit || MESSAGE_LIMITS.FREE;
    
    if (!data) {
      // No record found, return default state
      const now = new Date();
      
      // Use subscription_end if available, otherwise default to next month
      const nextReset = subscriberData?.subscription_end 
        ? new Date(subscriberData.subscription_end) 
        : getNextMonthDate(now);
      
      return {
        count: 0,
        limit: messageLimit,
        lastReset: now,
        nextReset: nextReset,
        percentUsed: 0,
        canSendMessage: true,
        daysUntilReset: Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      };
    }
    
    const lastResetTime = new Date(data.last_reset_time);
    const now = new Date();
    
    // Use subscription_end if available, otherwise default to next month
    const nextReset = subscriberData?.subscription_end 
      ? new Date(subscriberData.subscription_end) 
      : getNextMonthDate(now);
    
    // Calculate percentage used
    const percentUsed = Math.min(Math.round((data.count / messageLimit) * 100), 100);
    
    // Determine if user can send message
    const canSendMessage = subscriberData?.subscribed || data.count < messageLimit;
    
    // Calculate days until reset
    const daysUntilReset = Math.ceil((nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      count: data.count,
      limit: messageLimit,
      lastReset: lastResetTime,
      nextReset,
      percentUsed,
      canSendMessage,
      daysUntilReset
    };
  } catch (err) {
    console.error("Error in getMessageCount:", err);
    return null;
  }
};

/**
 * Helper function to get the first day of the next month
 */
const getNextMonthDate = (date: Date): Date => {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
};

/**
 * Checks if a user has exceeded their message limit
 * Returns a boolean indicating if they can send more messages
 */
export const checkMessageLimitExceeded = async (): Promise<boolean> => {
  const currentState = await getMessageCount();
  
  if (!currentState) {
    return false; // If we can't get the count, allow the message to be sent
  }
  
  return !currentState.canSendMessage;
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
    
    // Update or insert message count record
    const { data: messageCountData } = await supabase
      .from('message_counts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (messageCountData) {
      const { error } = await supabase
        .from('message_counts')
        .update({ 
          count: messageCountData.count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error incrementing message count:", error);
        return false;
      }
    } else {
      // Create new record if it doesn't exist
      const { error } = await supabase
        .from('message_counts')
        .insert([{ 
          user_id: userId, 
          count: 1, 
          last_reset_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) {
        console.error("Error creating message count:", error);
        return false;
      }
    }
    
    return true;
  } catch (err) {
    console.error("Error in incrementMessageCount:", err);
    return false;
  }
};

/**
 * Reset message count for a user 
 * Used when subscription_end changes
 */
export const resetMessageCount = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('message_counts')
      .update({ 
        count: 0, 
        last_reset_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error resetting message count:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Error in resetMessageCount:", err);
    return false;
  }
};
