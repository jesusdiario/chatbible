
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "./useSubscription";

export const useMessageCount = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { 
    usedMessages, 
    messageLimit, 
    subscriptionEnd, 
    canSendMessage,
    trackUsage
  } = useSubscription();

  // Calculate days until reset
  const daysUntilReset = subscriptionEnd
    ? Math.ceil((subscriptionEnd.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
    : 30;  // Default to 30 days if no subscription end date

  // Calculate percentage of usage
  const percentUsed = messageLimit > 0 
    ? Math.round((usedMessages / messageLimit) * 100) 
    : 0;

  // Function to increment message count
  const incrementMessageCount = async () => {
    try {
      const result = await trackUsage('chat_msg', 1);
      return result?.success || false;
    } catch (error) {
      console.error("Error incrementing message count:", error);
      return false;
    }
  };

  // Helper function to check if the user can send another message
  const checkCanSendMessage = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return true; // No session, assume can send (will be handled by auth)
      
      const userId = sessionData.session.user.id;
      const { data } = await supabase.rpc('check_message_quota', { user_id_param: userId });
      
      return data !== false;
    } catch (error) {
      console.error("Error checking message quota:", error);
      return true; // Default to true on error to avoid blocking
    }
  }, []);

  useEffect(() => {
    const loadInitialState = async () => {
      setLoading(true);
      const canSend = await checkCanSendMessage();
      setLoading(false);
    };
    
    loadInitialState();
  }, [checkCanSendMessage]);

  // Alias for incrementMessageCount
  const increment = incrementMessageCount;
  
  return {
    messageCount: usedMessages,
    messageLimit,
    daysUntilReset,
    loading,
    canSendMessage,
    percentUsed,
    incrementMessageCount,
    increment,
    refresh: checkCanSendMessage
  };
};
