
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MessageCount {
  id: string;
  user_id: string;
  count: number;
  last_reset_time: string;
}

export const useMessageCount = () => {
  const [messageCount, setMessageCount] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const MESSAGE_LIMIT = 10;
  const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days

  useEffect(() => {
    const fetchOrCreateMessageCount = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        const userId = session.user.id;
        const { data, error } = await supabase
          .from('message_counts')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar contador de mensagens:", error);
          setLoading(false);
          return;
        }

        if (!data) {
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
            console.error("Erro ao criar contador de mensagens:", insertError);
            setLoading(false);
            return;
          }

          setMessageCount(0);
        } else {
          const lastResetTime = new Date(data.last_reset_time).getTime();
          const currentTime = Date.now();
          const timeElapsed = currentTime - lastResetTime;

          if (timeElapsed >= RESET_TIME) {
            const { error: updateError } = await supabase
              .from('message_counts')
              .update({ 
                count: 0, 
                last_reset_time: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);

            if (updateError) {
              console.error("Erro ao resetar contador de mensagens:", updateError);
            }

            setMessageCount(0);
            setTimeUntilReset(RESET_TIME);
          } else {
            setMessageCount(data.count);
            setTimeUntilReset(RESET_TIME - timeElapsed);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao processar contador de mensagens:", error);
        setLoading(false);
      }
    };

    fetchOrCreateMessageCount();

    const intervalId = setInterval(() => {
      if (timeUntilReset > 0) {
        setTimeUntilReset(prev => {
          const newTime = prev - 60000;
          if (newTime <= 0) {
            fetchOrCreateMessageCount();
            return 0;
          }
          return newTime;
        });
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    messageCount,
    setMessageCount,
    timeUntilReset,
    loading,
    MESSAGE_LIMIT
  };
};
