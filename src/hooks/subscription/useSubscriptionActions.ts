
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserSubscription } from "@/types/subscription";
import { resetUserMessageCount } from "@/services/messageCountService";

export const useSubscriptionActions = (setState?: (state: React.SetStateAction<UserSubscription>) => void) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkSubscription = async () => {
    if (!setState) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Check if user is authenticated
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Get subscription data from the subscribers table
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
      
      if (subscriberError && subscriberError.code !== 'PGRST116') {
        console.log("Não foi possível encontrar dados de assinatura na tabela, verificando via Edge Function");
        
        // Call edge function as a fallback
        const { data: functionData, error: functionError } = await supabase.functions.invoke('check-subscription');
        
        if (functionError) throw functionError;
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          subscribed: functionData.subscribed || false,
          subscriptionTier: functionData.subscription_tier || "Gratuito",
          subscriptionEnd: functionData.subscription_end ? new Date(functionData.subscription_end) : null,
          messageLimit: functionData.message_limit || 10,
          plan: functionData.subscription_data || null
        }));
        
        return;
      }
      
      // If found data in subscribers table
      const isActive = subscriberData?.subscribed && 
                     (subscriberData.subscription_end ? new Date(subscriberData.subscription_end) > new Date() : false);
      
      // Get subscription plan details if available
      let plan = null;
      if (subscriberData?.subscription_tier) {
        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', subscriberData.subscription_tier)
          .single();
          
        if (planData) {
          plan = planData;
        }
      }
      
      // Check if we need to reset message count due to subscription changes
      if (subscriberData?.subscription_end) {
        const { data: messageCountData } = await supabase
          .from('message_counts')
          .select('last_reset_time')
          .eq('user_id', userData.user.id)
          .single();

        if (messageCountData) {
          const lastReset = new Date(messageCountData.last_reset_time);
          const subscriptionEnd = new Date(subscriberData.subscription_end);
          
          // If the subscription_end is more recent than the last reset, reset the count
          if (lastReset < subscriptionEnd) {
            await resetUserMessageCount(userData.user.id);
          }
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        subscribed: isActive,
        subscriptionTier: subscriberData?.subscription_tier || "Gratuito",
        subscriptionEnd: subscriberData?.subscription_end ? new Date(subscriberData.subscription_end) : null,
        messageLimit: plan?.message_limit || prev.messageLimit,
        plan: plan
      }));
      
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
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
      setState(prev => ({ ...prev, isLoading: true }));
      setIsProcessing(true);
      
      console.log(`Iniciando checkout com priceId: ${priceId}`);
      
      // Verificar autenticação do usuário antes de iniciar o checkout
      const { data: userData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !userData.user) {
        console.error('Usuário não autenticado:', authError);
        toast({
          title: "Erro",
          description: "Você precisa estar logado para assinar um plano",
          variant: "destructive",
        });
        setState(prev => ({ ...prev, isLoading: false }));
        setIsProcessing(false);
        return;
      }
      
      // Chamar a edge function para criar o checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, successUrl, cancelUrl }
      });

      if (error) {
        console.error('Erro na função create-checkout:', error);
        throw new Error(`Erro na função create-checkout: ${error.message}`);
      }
      
      if (!data) {
        console.error('Dados de resposta vazios da função create-checkout');
        throw new Error('Dados de resposta vazios da função create-checkout');
      }
      
      if (!data.url) {
        console.error('URL de checkout não recebida:', data);
        throw new Error('URL de checkout não recebida');
      }
      
      console.log('Checkout criado com sucesso, redirecionando para:', data.url);
      window.location.href = data.url;
      
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

  return {
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    isProcessing,
    refreshSubscription: checkSubscription
  };
};
