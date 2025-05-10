
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "./useSubscription";

export const useMessageCount = (messageLimitFromProps?: number) => {
  const [messageCount, setMessageCount] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [loading, setLoading] = useState(true);
  const { subscribed, messageLimit: subscriptionMessageLimit } = useSubscription();
  const { toast } = useToast();
  const fetchInProgressRef = useRef(false);

  const DEFAULT_MESSAGE_LIMIT = 10;
  const MESSAGE_LIMIT = messageLimitFromProps || subscriptionMessageLimit || DEFAULT_MESSAGE_LIMIT;
  const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // 30 dias

  // Add this function to fetch or create the message count
  const fetchOrCreateMessageCount = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (fetchInProgressRef.current) {
      return;
    }
    
    try {
      fetchInProgressRef.current = true;
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        fetchInProgressRef.current = false;
        return;
      }

      const userId = session.user.id;

      // Continue with message count fetch
      const { data, error } = await supabase
        .from('message_counts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao buscar contador de mensagens:", error);
        setLoading(false);
        fetchInProgressRef.current = false;
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
          fetchInProgressRef.current = false;
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
      fetchInProgressRef.current = false;
    } catch (error) {
      console.error("Erro ao processar contador de mensagens:", error);
      setLoading(false);
      fetchInProgressRef.current = false;
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
      if (!session) return false;
  
      const userId = session.user.id;
      
      // Usuários Pro sempre podem enviar mensagens
      if (!subscribed && messageCount >= MESSAGE_LIMIT) {
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
        return false;
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
  const canSendMessage = subscribed || messageCount < MESSAGE_LIMIT;
  
  // Dias restantes para reset
  const daysUntilReset = Math.ceil(timeUntilReset / (24 * 60 * 60 * 1000));
  
  // Calcular a porcentagem de uso
  const percentUsed = Math.round((messageCount / MESSAGE_LIMIT) * 100);

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
    MESSAGE_LIMIT,
    messageLimit: MESSAGE_LIMIT,
    percentUsed,
    refresh: fetchOrCreateMessageCount
  };
};

export default useMessageCount;
