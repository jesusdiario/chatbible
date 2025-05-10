
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Default message limits by plan
const MESSAGE_LIMITS = {
  FREE: 10,
  STANDARD: 50,
  PREMIUM: 200
};

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
 * DISABLED: Temporarily returns simulated values to prevent excessive DB calls
 */
export const getMessageCount = async (): Promise<MessageCountState | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    // DISABLED: Real DB queries
    // Return simulated data to avoid API calls
    
    // Verificar se o usuário tem assinatura usando localStorage
    const cachedSubscriptionStatus = localStorage.getItem('user_subscription_status');
    const isSubscribed = cachedSubscriptionStatus === 'subscribed';
    
    const now = new Date();
    const nextMonth = getNextMonthDate(now);
    
    // Valores simulados para evitar chamadas ao banco
    return {
      count: 0,
      limit: isSubscribed ? 10000 : MESSAGE_LIMITS.FREE,
      lastReset: now,
      nextReset: nextMonth,
      percentUsed: 0,
      canSendMessage: true,
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
 * DISABLED: Always returns false to prevent excessive DB calls
 */
export const checkMessageLimitExceeded = async (): Promise<boolean> => {
  // DISABLED: Chamadas reais ao banco
  // Sempre retorna false para permitir o envio de mensagens
  return false;
};

/**
 * Increments the message count for the user
 * DISABLED: Always returns true without making DB calls
 */
export const incrementMessageCount = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }
    
    // DISABLED: Verificação e incremento real
    // Verificar se o usuário tem assinatura usando localStorage
    const cachedSubscriptionStatus = localStorage.getItem('user_subscription_status');
    
    // Se o usuário tem assinatura, sempre pode enviar mensagem
    if (cachedSubscriptionStatus === 'subscribed') {
      return true;
    }
    
    // Para usuários gratuitos, permitir envio sem incrementar o contador de verdade
    // Em uma implementação futura, podemos reabilitar a contagem real
    return true;
  } catch (err) {
    console.error("Error in incrementMessageCount:", err);
    return false;
  }
};

/**
 * Reset message count for a user 
 * DISABLED: Does nothing to prevent DB calls
 */
export const resetMessageCount = async (userId: string): Promise<boolean> => {
  // DISABLED: Chamadas reais ao banco
  // Simular sucesso sem fazer nada
  return true;
};
