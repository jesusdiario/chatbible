
import { supabase } from "@/integrations/supabase/client";

export interface MessageCountState {
  count: number;
  limit: number;
  percentUsed: number;
  nextReset: Date;
  canSendMessage: boolean;
}

export const getMessageCount = async (): Promise<MessageCountState> => {
  try {
    // Get current user session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("No user session");
    }

    const userId = sessionData.session.user.id;
    
    // Call the edge function to track usage (0 amount to just get current state)
    const { data, error } = await supabase.functions.invoke("track-usage", {
      body: { usage_type: "check", amount: 0 }
    });

    if (error) {
      throw error;
    }

    // Get the next reset date (first day of next month)
    const today = new Date();
    const nextReset = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    return {
      count: data.current_usage || 0,
      limit: data.limit || 10,
      percentUsed: data.limit ? Math.round((data.current_usage / data.limit) * 100) : 0,
      nextReset,
      canSendMessage: data.canSendMessage !== false
    };
  } catch (error) {
    console.error("Error fetching message count:", error);
    // Return default values if error
    const today = new Date();
    const nextReset = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return {
      count: 0,
      limit: 10,
      percentUsed: 0,
      nextReset,
      canSendMessage: true
    };
  }
};

export const incrementMessageCount = async (): Promise<boolean> => {
  try {
    // Call the edge function to track usage
    const { data, error } = await supabase.functions.invoke("track-usage", {
      body: { usage_type: "chat_msg", amount: 1 }
    });

    if (error) {
      throw error;
    }

    return data.success || false;
  } catch (error) {
    console.error("Error incrementing message count:", error);
    return false;
  }
};
