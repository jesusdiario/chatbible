
import { useState, useEffect, useCallback } from "react";
import { getMessageCount, incrementMessageCount, MessageCountState } from "@/services/messageCountService";

export const useMessageCount = () => {
  const [state, setState] = useState<MessageCountState | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch message count
  const fetchMessageCount = useCallback(async () => {
    try {
      setLoading(true);
      const countState = await getMessageCount();
      setState(countState);
    } catch (error) {
      console.error("Error fetching message count:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMessageCount();
    
    // Refresh count every minute in case it was changed in another tab
    const intervalId = setInterval(() => {
      fetchMessageCount();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchMessageCount]);

  // Function to increment message count
  const increment = useCallback(async () => {
    const success = await incrementMessageCount();
    if (success) {
      fetchMessageCount();
    }
    return success;
  }, [fetchMessageCount]);

  return {
    messageCount: state?.count || 0,
    messageLimit: state?.limit || 10,
    percentUsed: state?.percentUsed || 0,
    canSendMessage: state?.canSendMessage ?? true,
    daysUntilReset: state?.daysUntilReset || 30,
    loading,
    increment,
    refresh: fetchMessageCount
  };
};

export default useMessageCount;
