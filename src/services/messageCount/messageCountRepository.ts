
/**
 * Data access layer for message count operations
 */
import { supabase } from '@/integrations/supabase/client';
import { MessageCountState } from './messageCountTypes';
import { calculateDaysUntilDate, getNextMonthDate } from './messageCountUtils';

/**
 * Get user's subscription details
 * @param userId The user ID
 * @returns Subscription data and plan info
 */
export async function getUserSubscriptionData(userId: string) {
  // Get user's subscription info
  const { data: subscriberData } = await supabase
    .from('subscribers')
    .select('subscription_tier, subscribed, subscription_end')
    .eq('user_id', userId)
    .single();
  
  // Get subscription plan details
  const { data: planData } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('name', subscriberData?.subscription_tier || 'Gratuito')
    .single();
    
  return { subscriberData, planData };
}

/**
 * Get user's message count record
 * @param userId The user ID
 * @returns Message count record or null if not found
 */
export async function getUserMessageCount(userId: string) {
  const { data, error } = await supabase
    .from('message_counts')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error("Error fetching message count:", error);
    return null;
  }
  
  return data;
}

/**
 * Create a new message count record
 * @param userId The user ID
 * @returns The created record or null if error
 */
export async function createMessageCount(userId: string, count: number = 0) {
  const { data, error } = await supabase
    .from('message_counts')
    .insert([{ 
      user_id: userId, 
      count, 
      last_reset_time: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error("Error creating message count:", error);
    return null;
  }
  
  return data;
}

/**
 * Update a message count record
 * @param userId The user ID
 * @param count New count value
 * @returns True if successful, false otherwise
 */
export async function updateMessageCount(userId: string, count: number) {
  const { error } = await supabase
    .from('message_counts')
    .update({ 
      count,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (error) {
    console.error("Error updating message count:", error);
    return false;
  }
  
  return true;
}

/**
 * Reset a user's message count
 * @param userId The user ID
 * @returns True if successful, false otherwise
 */
export async function resetMessageCount(userId: string) {
  const { error } = await supabase
    .from('message_counts')
    .update({ 
      count: 0, 
      last_reset_time: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
    
  if (error) {
    console.error("Error resetting user message count:", error);
    return false;
  }
  
  return true;
}

/**
 * Builds a MessageCountState object from raw data
 */
export function buildMessageCountState(
  count: number,
  limit: number, 
  lastReset: Date,
  nextReset: Date
): MessageCountState {
  const percentUsed = Math.min(Math.round((count / limit) * 100), 100);
  const canSendMessage = count < limit;
  const daysUntil = calculateDaysUntilDate(nextReset);
  
  return {
    count,
    limit,
    lastReset,
    nextReset,
    percentUsed,
    canSendMessage,
    daysUntilReset: daysUntil
  };
}
