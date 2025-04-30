
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionState } from '@/types/subscription';
import { useState } from "react";

export const useSubscriptionActions = (setState?: (state: React.SetStateAction<SubscriptionState>) => void) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkSubscription = async () => {
    if (!setState) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Call check-subscription edge function
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      // Get customer data from DB
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("User not authenticated");
      }
      
      const { data: customerData } = await supabase
        .from('customers')
        .select(`
          *,
          price_plans:current_plan_id (*)
        `)
        .eq('user_id', sessionData.session.user.id)
        .single();
      
      // Get usage from view
      const { data: usageData } = await supabase
        .from('v_current_usage')
        .select('*')
        .eq('user_id', sessionData.session.user.id)
        .single();
      
      setState({
        isLoading: false,
        subscribed: data.subscribed,
        subscriptionTier: data.subscription_tier,
        subscriptionEnd: data.subscription_end ? new Date(data.subscription_end) : null,
        messageLimit: data.message_limit,
        plan: customerData?.price_plans,
        canSendMessage: data.can_send_message !== false,
        usedMessages: usageData?.msgs_used || 0,
        customer: customerData
      });
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      // Don't show error toast to avoid interrupting user experience
      if (setState) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false 
        }));
      }
    }
  };

  const startCheckout = async (priceId: string, successUrl?: string, cancelUrl?: string) => {
    if (!setState) return;
    
    try {
      setIsProcessing(true);
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, successUrl, cancelUrl }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo de assinatura",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, isLoading: false }));
      setIsProcessing(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL do portal não recebida');
      }
    } catch (error) {
      console.error('Erro ao abrir portal do cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento",
        variant: "destructive",
      });
      if (setState) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const trackUsage = async (usageType: string, amount: number, context?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('track-usage', {
        body: { usage_type: usageType, amount, context }
      });
      
      if (error) {
        console.error('Erro ao registrar uso:', error);
        return { success: false, error };
      }
      
      if (data.limitExceeded) {
        toast({
          title: "Limite de mensagens excedido",
          description: "Você atingiu seu limite mensal de mensagens. Faça upgrade para o plano Premium.",
          variant: "destructive",
        });
      }
      
      return { 
        success: data.success, 
        usedMessages: data.current_usage,
        messageLimit: data.limit,
        canSendMessage: data.canSendMessage
      };
    } catch (error) {
      console.error('Erro ao registrar uso:', error);
      return { success: false, error };
    }
  };

  return {
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    trackUsage,
    isProcessing
  };
};
