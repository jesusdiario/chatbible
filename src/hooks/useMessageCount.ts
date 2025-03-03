
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Configurações de limite
export const MESSAGE_LIMIT = 10; // Número máximo de mensagens permitidas
export const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // Tempo de reset em milissegundos (30 dias)

export const useMessageCount = () => {
  const [messageCount, setMessageCount] = useState(0);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Função para buscar ou criar o contador de mensagens do usuário
    const fetchOrCreateMessageCount = async () => {
      try {
        setLoading(true);
        
        // Verificar se o usuário está autenticado
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("Usuário não autenticado");
          setLoading(false);
          return;
        }
        
        const userId = session.user.id;
        
        // Buscar o contador de mensagens do usuário
        const { data: messageCountData, error: fetchError } = await supabase
          .from('message_counts')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (fetchError) {
          console.error("Erro ao buscar contador de mensagens:", fetchError);
          setLoading(false);
          return;
        }
        
        // Se não existir um registro, criar um novo
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
            console.error("Erro ao criar contador de mensagens:", insertError);
            setLoading(false);
            return;
          }
          
          if (newData) {
            setMessageCount(0);
            setTimeUntilReset(RESET_TIME);
          }
        } else {
          // Verificar se é hora de resetar o contador
          const lastResetTime = new Date(messageCountData.last_reset_time).getTime();
          const currentTime = Date.now();
          const timeElapsed = currentTime - lastResetTime;
          
          if (timeElapsed >= RESET_TIME) {
            // Resetar o contador
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
            // Atualizar o contador e o tempo restante
            setMessageCount(messageCountData.count);
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
    
    // Atualizar o temporizador a cada minuto
    const intervalId = setInterval(() => {
      if (timeUntilReset > 0) {
        setTimeUntilReset(prev => {
          const newTime = prev - 60000;
          if (newTime <= 0) {
            fetchOrCreateMessageCount(); // Recarregar dados quando o timer zerar
            return 0;
          }
          return newTime;
        });
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Função para incrementar o contador de mensagens
  const incrementMessageCount = async () => {
    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("Usuário não autenticado");
        return false;
      }
      
      const userId = session.user.id;
      
      // Incrementar o contador de mensagens
      const newCount = messageCount + 1;
      const { error } = await supabase
        .from('message_counts')
        .update({ 
          count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Erro ao atualizar contador de mensagens:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao processar sua mensagem. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }
      
      setMessageCount(newCount);
      return true;
    } catch (error) {
      console.error("Erro ao processar envio de mensagem:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Verificar se o usuário atingiu o limite de mensagens
  const hasReachedLimit = () => messageCount >= MESSAGE_LIMIT;

  return { 
    messageCount, 
    timeUntilReset, 
    loading, 
    hasReachedLimit, 
    incrementMessageCount 
  };
};
