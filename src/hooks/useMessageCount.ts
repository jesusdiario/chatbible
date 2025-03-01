
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MessageCountState {
  count: number;
  timeUntilReset: number;
  loading: boolean;
}

export const useMessageCount = (messageLimit: number, resetTime: number) => {
  const [state, setState] = useState<MessageCountState>({
    count: 0,
    timeUntilReset: 0,
    loading: true
  });

  useEffect(() => {
    // Fetch or create the counter of messages
    const fetchOrCreateMessageCount = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("User not authenticated");
          setState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        const userId = session.user.id;
        
        // Fetch the message counter
        const { data: messageCountData, error: fetchError } = await supabase
          .from('message_counts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (fetchError) {
          console.error("Error fetching message counter:", fetchError);
          setState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        // If no record exists, create a new one
        if (!messageCountData) {
          const { data: newData, error: insertError } = await supabase
            .from('message_counts')
            .insert([{ 
              user_id: userId, 
              count: 0, 
              last_reset_time: new Date().toISOString() 
            }])
            .select()
            .single();
          
          if (insertError) {
            console.error("Error creating message counter:", insertError);
            setState(prev => ({ ...prev, loading: false }));
            return;
          }
          
          if (newData) {
            setState({
              count: 0,
              timeUntilReset: resetTime,
              loading: false
            });
          }
        } else {
          // Check if it's time to reset the counter
          const lastResetTime = new Date(messageCountData.last_reset_time).getTime();
          const currentTime = Date.now();
          const timeElapsed = currentTime - lastResetTime;
          
          if (timeElapsed >= resetTime) {
            // Reset the counter
            const { error: updateError } = await supabase
              .from('message_counts')
              .update({ 
                count: 0, 
                last_reset_time: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);
            
            if (updateError) {
              console.error("Error resetting message counter:", updateError);
            }
            
            setState({
              count: 0,
              timeUntilReset: resetTime,
              loading: false
            });
          } else {
            // Update counter and remaining time
            setState({
              count: messageCountData.count,
              timeUntilReset: resetTime - timeElapsed,
              loading: false
            });
          }
        }
      } catch (error) {
        console.error("Error processing message counter:", error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchOrCreateMessageCount();
    
    // Update timer every minute
    const intervalId = setInterval(() => {
      setState(prev => {
        if (prev.timeUntilReset > 0) {
          const newTime = prev.timeUntilReset - 60000;
          if (newTime <= 0) {
            fetchOrCreateMessageCount(); // Reload data when timer reaches zero
            return prev;
          }
          return { ...prev, timeUntilReset: newTime };
        }
        return prev;
      });
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [resetTime]);

  const incrementCount = async (): Promise<boolean> => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("User not authenticated");
        return false;
      }
      
      const userId = session.user.id;
      
      // Increment message counter
      const newCount = state.count + 1;
      const { error } = await supabase
        .from('message_counts')
        .update({ 
          count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error updating message counter:", error);
        return false;
      }
      
      setState(prev => ({ ...prev, count: newCount }));
      return true;
    } catch (error) {
      console.error("Error processing message sending:", error);
      return false;
    }
  };

  const hasReachedLimit = state.count >= messageLimit;

  return {
    count: state.count,
    timeUntilReset: state.timeUntilReset,
    loading: state.loading,
    incrementCount,
    hasReachedLimit
  };
};
