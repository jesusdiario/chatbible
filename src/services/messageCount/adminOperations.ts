
import { supabase } from '@/integrations/supabase/client';

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
