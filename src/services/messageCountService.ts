
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MessageCountState {
  count: number;
  limit: number;
  lastReset: Date;
  nextReset: Date;
  percentUsed: number;
  canSendMessage: boolean;
  daysUntilReset: number;
}

/**
 * Fetches the current message count for the user
 * Todos os usuários autenticados têm acesso irrestrito, não há mais verificação de limite
 */
export const getMessageCount = async (): Promise<MessageCountState | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // Verificar se o usuário está autenticado
    const isAuthenticated = !!session.user.id;
    
    const now = new Date();
    const nextMonth = getNextMonthDate(now);
    
    // Usuários autenticados têm limite "infinito"
    return {
      count: 0,
      limit: 10000, // Valor arbitrário alto
      lastReset: now,
      nextReset: nextMonth,
      percentUsed: 0,
      canSendMessage: isAuthenticated, // Só pode enviar mensagem se estiver autenticado
      daysUntilReset: 30
    };
  } catch (err) {
    console.error("Error in getMessageCount:", err);
    return null;
  }
};

/**
 * Helper function to get the first day of the next month
 */
const getNextMonthDate = (date: Date): Date => {
  const nextMonth = new Date(date);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
};

/**
 * Checks if a user has exceeded their message limit
 * Usuários autenticados nunca excedem o limite
 */
export const checkMessageLimitExceeded = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    // Se estiver autenticado, nunca excede o limite
    return !session?.user;
  } catch (err) {
    console.error("Error in checkMessageLimitExceeded:", err);
    return true; // Em caso de erro, é mais seguro bloquear
  }
};

/**
 * Increments the message count for the user
 * Não há mais incremento de contador, apenas verificação de autenticação
 */
export const incrementMessageCount = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Se estiver autenticado, sempre pode enviar mensagem
    return !!session?.user;
  } catch (err) {
    console.error("Error in incrementMessageCount:", err);
    return false;
  }
};

/**
 * Reset message count for a user 
 * Função mantida para compatibilidade com código existente
 */
export const resetMessageCount = async (userId: string): Promise<boolean> => {
  // Não faz nada, apenas retorna sucesso
  return true;
};
