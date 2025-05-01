
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Busca o limite de mensagens no plano ativo (`subscribers` + `subscription_plans`) */
async function getPlanLimit(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("subscribers")
    .select("subscription_plans(message_limit)")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("Erro buscando plano:", error);
    return 10; // fallback
  }
  return data?.subscription_plans?.message_limit ?? 10;
}

export const useMessageCount = () => {
  const [messageCount, setMessageCount] = useState(0);
  const [messageLimit, setMessageLimit] = useState(10);
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const [loading, setLoading] = useState(true);

  const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // 30 dias

  /** Busca (ou cria) registro + limite do plano */
  const fetchOrCreate = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // 1) quanto o plano permite?
      setMessageLimit(await getPlanLimit(userId));

      // 2) registro em message_counts
      let { data, error } = await supabase
        .from("message_counts")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("MsgCount query:", error);
        setLoading(false);
        return;
      }
      
      if (!data) {
        const { data: newRow, error: insErr } = await supabase
          .from("message_counts")
          .insert({ user_id: userId, count: 0, last_reset_time: new Date() })
          .select()
          .single();
        
        if (insErr) {
          console.error("Erro ao criar contador de mensagens:", insErr);
          setLoading(false);
          return;
        }
        
        data = newRow;
      }
      
      /* ── reset se passou 30 dias ── */
      const elapsed = Date.now() - new Date(data.last_reset_time).getTime();
      if (elapsed >= RESET_TIME) {
        const { error: updateError } = await supabase
          .from("message_counts")
          .update({ 
            count: 0, 
            last_reset_time: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);
          
        if (updateError) {
          console.error("Erro ao resetar contador de mensagens:", updateError);
        }
        
        setMessageCount(0);
        setTimeUntilReset(RESET_TIME);
      } else {
        setMessageCount(data.count);
        setTimeUntilReset(RESET_TIME - elapsed);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Erro ao processar contador de mensagens:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchOrCreate(); 
    
    const intervalId = setInterval(() => {
      if (timeUntilReset > 0) {
        setTimeUntilReset(prev => {
          const newTime = prev - 60000;
          if (newTime <= 0) {
            fetchOrCreate();
            return 0;
          }
          return newTime;
        });
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchOrCreate, timeUntilReset]);

  /** ++1 de forma transacional (evita race-condition) */
  const increment = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { error } = await supabase.rpc("increment_message_count", { uid: session.user.id });
      if (error) { 
        console.error("RPC increment_message_count:", error); 
        return; 
      }
      
      setMessageCount((c) => c + 1);
    } catch (error) {
      console.error("Erro ao incrementar contador de mensagens:", error);
    }
  };

  const percentUsed = messageLimit ? Math.round((messageCount / messageLimit) * 100) : 0;
  const canSendMessage = messageCount < messageLimit;
  const daysUntilReset = Math.ceil(timeUntilReset / (24 * 60 * 60 * 1000));

  return {
    messageCount,
    messageLimit,
    percentUsed,
    daysUntilReset,
    canSendMessage,
    loading,
    increment,
    incrementMessageCount: increment, // alias for backward compatibility
    refresh: fetchOrCreate,
  };
};

export default useMessageCount;
