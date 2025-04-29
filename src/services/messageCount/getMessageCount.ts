
import { supabase } from '@/integrations/supabase/client';
import { MessageCountState, MESSAGE_LIMITS } from '@/types/messageCount';
import { getNextResetDate } from '@/utils/dateUtils';

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
      .select('subscription_tier, subscribed')
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
      const nextMonth = getNextResetDate();
      
      return {
        count: 0,
        limit: messageLimit,
        lastReset: now,
        nextReset: nextMonth,
        percentUsed: 0,
        canSendMessage: true
      };
    }
    
    const lastResetTime = new Date(data.last_reset_time);
    const nextReset = getNextResetDate();
    
    // Calculate percentage used
    const percentUsed = Math.min(Math.round((data.count / messageLimit) * 100), 100);
    
    // Determine if user can send message
    const canSendMessage = data.count < messageLimit;
    
    return {
      count: data.count,
      limit: messageLimit,
      lastReset: lastResetTime,
      nextReset,
      percentUsed,
      canSendMessage
    };
  } catch (err) {
    console.error("Error in getMessageCount:", err);
    return null;
  }
};
