
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { getMessageCount } from './getMessageCount';

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
