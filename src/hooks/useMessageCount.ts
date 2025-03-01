
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MessageCountData {
  count: number;
  timeUntilReset: number;
  loading: boolean;
  incrementCount: () => Promise<{ success: boolean; limitReached: boolean }>;
}

// Message limit configuration
const MESSAGE_LIMIT = 10; // Maximum messages allowed
const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // Reset time in milliseconds (30 days)

export function useMessageCount(): MessageCountData {
  const [messageCount, setMessageCount] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to fetch or create the user's message count
  const fetchOrCreateMessageCount = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("User not authenticated");
        setLoading(false);
        return;
      }
      
      const userId = session.user.id;
      
      // Fetch the user's message count
      const { data: messageCountData, error: fetchError } = await supabase
        .from('message_counts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error fetching message count:", fetchError);
        setLoading(false);
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
          console.error("Error creating message count:", insertError);
          setLoading(false);
          return;
        }
        
        if (newData) {
          setMessageCount(0);
          setTimeUntilReset(RESET_TIME);
        }
      } else {
        // Check if it's time to reset the counter
        const lastResetTime = new Date(messageCountData.last_reset_time).getTime();
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastResetTime;
        
        if (timeElapsed >= RESET_TIME) {
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
            console.error("Error resetting message count:", updateError);
          }
          
          setMessageCount(0);
          setTimeUntilReset(RESET_TIME);
        } else {
          // Update the counter and remaining time
          setMessageCount(messageCountData.count);
          setTimeUntilReset(RESET_TIME - timeElapsed);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error processing message count:", error);
      setLoading(false);
    }
  };

  // Function to increment the message count
  const incrementCount = async (): Promise<{ success: boolean; limitReached: boolean }> => {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("User not authenticated");
        toast({
          title: "Error",
          description: "You need to be logged in to send messages.",
          variant: "destructive"
        });
        return { success: false, limitReached: false };
      }
      
      const userId = session.user.id;
      
      // Check if the user has reached the message limit
      if (messageCount >= MESSAGE_LIMIT) {
        toast({
          title: "Message limit reached",
          description: `You've reached the limit of ${MESSAGE_LIMIT} messages per month. Upgrade to premium.`,
        });
        return { success: false, limitReached: true };
      }
      
      // Increment the message count
      const newCount = messageCount + 1;
      const { error } = await supabase
        .from('message_counts')
        .update({ 
          count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error updating message count:", error);
        toast({
          title: "Error",
          description: "An error occurred while processing your message. Please try again.",
          variant: "destructive"
        });
        return { success: false, limitReached: false };
      }
      
      setMessageCount(newCount);
      
      // Check if the limit has been reached after this message
      const limitReached = newCount >= MESSAGE_LIMIT;
      if (limitReached) {
        toast({
          title: "Message limit reached",
          description: `You've reached the limit of ${MESSAGE_LIMIT} messages per month. Upgrade to premium.`,
        });
      }
      
      return { success: true, limitReached };
    } catch (error) {
      console.error("Error processing message sending:", error);
      toast({
        title: "Error",
        description: "An error occurred while sending your message. Please try again.",
        variant: "destructive"
      });
      return { success: false, limitReached: false };
    }
  };

  useEffect(() => {
    fetchOrCreateMessageCount();
    
    // Update the timer every minute
    const intervalId = setInterval(() => {
      if (timeUntilReset > 0) {
        setTimeUntilReset(prev => {
          const newTime = prev - 60000;
          if (newTime <= 0) {
            fetchOrCreateMessageCount(); // Reload data when timer reaches zero
            return 0;
          }
          return newTime;
        });
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  return {
    count: messageCount,
    timeUntilReset,
    loading,
    incrementCount
  };
}
