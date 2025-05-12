import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserSubscription } from "@/types/subscription";
import { resetMessageCount } from "@/services/messageCountService";

export const useSubscriptionActions = (setState?: (state: React.SetStateAction<UserSubscription>) => void) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!setState) return;
    
    try {
      console.log('[useSubscriptionActions] Checking subscription');
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Check if user is authenticated
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[useSubscriptionActions] Auth error:', userError);
        throw new Error("Erro de autenticação");
      }
      
      if (!userData.user) {
        console.log('[useSubscriptionActions] No authenticated user found');
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          subscribed: false,
          subscriptionTier: "Gratuito"
        }));
        return;
      }
      
      console.log('[useSubscriptionActions] Checking subscription for user:', userData.user.id);
      
      // First try to get data from subscribers table
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
      
      if (subscriberData) {
        console.log('[useSubscriptionActions] Subscriber data found:', subscriberData);
        
        // Determine if subscription is active based on end date
        const isActive = subscriberData.subscribed && 
                       (subscriberData.subscription_end ? new Date(subscriberData.subscription_end) > new Date() : false);
        
        // Get subscription plan details
        let plan = null;
        if (subscriberData.subscription_tier) {
          const { data: planData } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('name', subscriberData.subscription_tier)
            .single();
            
          if (planData) {
            console.log('[useSubscriptionActions] Plan data:', planData);
            plan = planData;
          }
        }
        
        // Check if subscription_end has changed, and if so, reset message count
        const storedSubscriptionEnd = localStorage.getItem(`subscription_end_${userData.user.id}`);
        const currentSubscriptionEnd = subscriberData?.subscription_end || '';
        
        if (storedSubscriptionEnd && storedSubscriptionEnd !== currentSubscriptionEnd) {
          console.log('[useSubscriptionActions] Subscription end date changed, resetting message count');
          await resetMessageCount(userData.user.id);
        }
        
        // Store current subscription end for future comparison
        localStorage.setItem(`subscription_end_${userData.user.id}`, currentSubscriptionEnd);
        
        setState(prev => ({
          ...prev,
          isLoading: false,
          subscribed: isActive,
          subscriptionTier: subscriberData.subscription_tier || "Gratuito",
          subscriptionEnd: subscriberData.subscription_end ? new Date(subscriberData.subscription_end) : null,
          messageLimit: plan?.message_limit || prev.messageLimit,
          plan: plan
        }));
        
        return;
      }
      
      console.log('[useSubscriptionActions] No subscriber data found, checking via Edge Function');
      
      // If no data in subscribers table, fallback to edge function
      const { data: functionData, error: functionError } = await supabase.functions.invoke('check-subscription');
      
      if (functionError) {
        console.error('[useSubscriptionActions] Edge function error:', functionError);
        throw new Error(`Erro ao verificar assinatura: ${functionError.message}`);
      }
      
      console.log('[useSubscriptionActions] Edge function response:', functionData);
      
      // IMPORTANTE: definir isLoading como false independentemente do resultado
      setState(prev => ({
        ...prev,
        isLoading: false,
        subscribed: functionData.subscribed || false,
        subscriptionTier: functionData.subscription_tier || "Gratuito",
        subscriptionEnd: functionData.subscription_end ? new Date(functionData.subscription_end) : null,
        messageLimit: functionData.message_limit || 10,
        plan: functionData.subscription_data || null
      }));
      
    } catch (error) {
      console.error('[useSubscriptionActions] Error checking subscription:', error);
      
      if (setState) {
        // IMPORTANTE: garantir que isLoading seja false mesmo em caso de erro
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          // Fallback to free tier on error
          subscribed: false,
          subscriptionTier: "Gratuito"
        }));
      }
      
      // Don't show error toast to avoid bothering users
      // toast({ title: "Aviso", description: "Não foi possível verificar seu status de assinatura", variant: "destructive" });
    }
  }, [setState, toast]);

  const startCheckout = async (priceId: string, email?: string, password?: string, name?: string, successUrl?: string, cancelUrl?: string) => {
    if (!setState) return;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setIsProcessing(true);
      
      console.log(`Iniciando checkout com priceId: ${priceId}`);
      
      const payload: Record<string, any> = { 
        priceId,
        successUrl: successUrl || `${window.location.origin}/payment-success`, 
        cancelUrl: cancelUrl || `${window.location.origin}/`
      };
      
      // Add user creation fields if provided
      if (email) payload.email = email;
      if (password) payload.password = password;
      if (name) payload.name = name;
      
      // Chamar a edge function para criar o checkout
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: payload
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
        description: error instanceof Error ? error.message : "Não foi possível iniciar o processo de assinatura",
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

  const refreshSubscription = async () => {
    console.log("[useSubscriptionActions] Refreshing subscription data");
    return checkSubscription();
  };

  return {
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    isProcessing,
    refreshSubscription
  };
};
