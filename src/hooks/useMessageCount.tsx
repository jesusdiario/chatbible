import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "./useSubscription";

interface MessageCount {
  id: string;
  user_id: string;
  count: number;
  last_reset_time: string;
}

export const useMessageCount = (messageLimitFromProps?: number) => {
  const [messageCount, setMessageCount] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [loading, setLoading] = useState(false); // Inicialmente false para evitar carregamentos desnecessários
  const { subscribed, messageLimit: subscriptionMessageLimit } = useSubscription();
  const { toast } = useToast();

  const DEFAULT_MESSAGE_LIMIT = 10;
  const MESSAGE_LIMIT = messageLimitFromProps || subscriptionMessageLimit || DEFAULT_MESSAGE_LIMIT;
  const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // 30 dias

  // Versão modificada da função que não faz requisições ao banco
  const fetchOrCreateMessageCount = useCallback(async () => {
    // Para usuários Pro, não precisamos buscar a contagem
    if (subscribed) {
      setMessageCount(0); // Valor ilustrativo para Pro
      setTimeUntilReset(RESET_TIME);
      setLoading(false);
      return;
    }
    
    // DISABLED: Contagem de mensagens temporariamente desativada
    // Apenas retorna valores padrão sem fazer chamadas ao banco
    setMessageCount(0);
    setTimeUntilReset(RESET_TIME);
    setLoading(false);
    
    // Código original está comentado para referência futura
    /*
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
    */
  }, [RESET_TIME, subscribed]);

  useEffect(() => {
    fetchOrCreateMessageCount();
    
    // Desativado: atualização periódica do contador
    /*
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
    */
  }, [fetchOrCreateMessageCount]);

  const incrementMessageCount = async () => {
    // Para usuários Pro, sempre permitimos enviar mensagens sem incrementar contador
    if (subscribed) return true;
    
    // DISABLED: Incremento de contador temporariamente desativado
    // Apenas simulamos o comportamento sem fazer chamadas ao banco
    const canSend = messageCount < MESSAGE_LIMIT;
    
    if (!canSend) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens. Faça upgrade para o plano Premium para mensagens ilimitadas.",
        variant: "destructive",
      });
      return false;
    }
    
    setMessageCount(prev => prev + 1);
    return true;
    
    // Código original está comentado para referência futura
    /*
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
    */
  };

  // Usuários Pro sempre podem enviar mensagens
  const canSendMessage = subscribed || messageCount < MESSAGE_LIMIT;
  
  // Dias restantes para reset - valor padrão para evitar cálculos desnecessários
  const daysUntilReset = Math.ceil(timeUntilReset / (24 * 60 * 60 * 1000));
  
  // Calcular a porcentagem de uso
  const percentUsed = Math.round((messageCount / MESSAGE_LIMIT) * 100);

  // Alias para incrementMessageCount
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
