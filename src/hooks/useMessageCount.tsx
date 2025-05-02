
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MessageCount {
  id: string;
  user_id: string;
  count: number;
  last_reset_time: string;
}

export const useMessageCount = (messageLimitFromProps?: number) => {
  const [messageCount, setMessageCount] = useState(0);
  const [messageLimit, setMessageLimit] = useState(messageLimitFromProps || 10);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // 30 dias

  // Add this function to fetch or create the message count
  const fetchOrCreateMessageCount = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // First check if user is subscribed and get their plan limit
      const { data: subData } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier')
        .eq('user_id', userId)
        .single();

      // If subscribed, set flag
      const userIsSubscribed = subData?.subscribed || false;
      setIsSubscribed(userIsSubscribed);

      // Get plan limit
      if (subData?.subscription_tier) {
        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('message_limit')
          .eq('name', subData.subscription_tier)
          .single();
          
        if (planData?.message_limit) {
          setMessageLimit(planData.message_limit);
        }
      }

      // Continue with message count fetch
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
  }, [RESET_TIME]);

  useEffect(() => {
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
  }, [fetchOrCreateMessageCount, timeUntilReset]);

  const incrementMessageCount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
  
      const userId = session.user.id;
      
      // Check if user can send message (Pro users can always send)
      if (!isSubscribed && messageCount >= messageLimit) {
        // Não exibe toast aqui, pois os diálogos e alertas visuais já cuidam disso
        return false;
      }

      // Proceed with increment
      const { data, error } = await supabase
        .from('message_counts')
        .update({ 
          count: messageCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();
      
      if (error) {
        console.error("Erro ao incrementar contador de mensagens:", error);
        return;
      }
      
      setMessageCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error("Erro ao incrementar contador de mensagens:", error);
      return false;
    }
  };

  // Verificar se o usuário ainda tem mensagens disponíveis
  // Pro users (subscribed) can always send messages
  const canSendMessage = isSubscribed || messageCount < messageLimit;
  
  // Dias restantes para reset
  const daysUntilReset = Math.ceil(timeUntilReset / (24 * 60 * 60 * 1000));
  
  // Calcular a porcentagem de uso
  const percentUsed = Math.round((messageCount / messageLimit) * 100);

  // Alias for incrementMessageCount
  const increment = incrementMessageCount;
  
  return {
    messageCount,
    setMessageCount,
    incrementMessageCount,
    increment,
    timeUntilReset,
    daysUntilReset,
    loading,
    canSendMessage,
    messageLimit,
    percentUsed,
    refresh: fetchOrCreateMessageCount,
    isSubscribed
  };
};

export default useMessageCount;
