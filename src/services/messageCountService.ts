
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

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
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      
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
    const now = new Date();
    
    // Calculate next reset date (first day of next month)
    const nextReset = new Date(now);
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);
    nextReset.setHours(0, 0, 0, 0);
    
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
    // Atualizado para não usar o RPC e fazer o update diretamente
    const { data: messageCountData } = await supabase
      .from('message_counts')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (messageCountData) {
      // Update existing record
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
      // Insert new record
      const { error } = await supabase
        .from('message_counts')
        .insert([{ 
          user_id: userId,
          count: 1,
          last_reset_time: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        
      if (error) {
        console.error("Error creating message count record:", error);
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
 * Calculate days until next reset (for displaying to user)
 */
export const getDaysUntilReset = (): number => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  
  const timeDiff = nextMonth.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Reset message counts for all users (to be called by a cron job)
 * This can be implemented as an Edge Function that runs monthly
 */
export const resetAllMessageCounts = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('message_counts')
      .update({ 
        count: 0, 
        last_reset_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error("Error resetting message counts:", error);
    }
  } catch (err) {
    console.error("Error in resetAllMessageCounts:", err);
  }
};
