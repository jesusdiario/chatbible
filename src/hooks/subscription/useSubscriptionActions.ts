
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserSubscription } from "@/types/subscription";
import { resetMessageCount } from "@/services/messageCountService";

export const useSubscriptionActions = (setState?: (state: React.SetStateAction<UserSubscription>) => void) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const checkSubscription = async () => {
    if (!setState) return false;
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Verificar se o usuário está autenticado
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.log("checkSubscription: Usuário não autenticado");
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          subscribed: false
        }));
        return false;
      }
      
      console.log("Verificando assinatura para usuário:", userData.user.id, userData.user.email);
      
      // Buscar dados de assinatura na tabela subscribers
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
      
      if (subscriberData) {
        console.log("Dados de assinatura encontrados na tabela 'subscribers':", subscriberData);
      } else {
        console.log("Nenhum dado de assinatura encontrado para o usuário");
      }
      
      if (subscriberError && subscriberError.code !== 'PGRST116') {
        console.log("Não foi possível encontrar dados de assinatura na tabela, verificando via Edge Function", subscriberError);
        
        // Chamar edge function como fallback
        const { data: functionData, error: functionError } = await supabase.functions.invoke('check-subscription');
        
        if (functionError) {
          console.error("Erro ao verificar assinatura via Edge Function:", functionError);
          throw functionError;
        }
        
        console.log("Dados de assinatura obtidos via Edge Function:", functionData);
        
        // Atualizar o estado com os dados da assinatura
        setState(prev => ({
          ...prev,
          isLoading: false,
          subscribed: functionData.subscribed || false,
          subscriptionTier: functionData.subscription_tier || "Gratuito",
          subscriptionEnd: functionData.subscription_end ? new Date(functionData.subscription_end) : null,
          messageLimit: functionData.message_limit || 10,
          plan: functionData.subscription_data || null
        }));
        
        // Verificar se a assinatura está ativa e retornar
        const isActive = functionData.subscribed && 
                      (functionData.subscription_end ? new Date(functionData.subscription_end) > new Date() : false);
        
        return isActive;
      }
      
      // Verificar se a assinatura é ativa e ainda está válida
      const isActive = subscriberData?.subscribed && 
                     (subscriberData.subscription_end ? new Date(subscriberData.subscription_end) > new Date() : false);
      
      console.log("Status da assinatura:", isActive ? "Ativa" : "Inativa", 
                 "Tier:", subscriberData?.subscription_tier || "Gratuito",
                 "Término:", subscriberData?.subscription_end || "N/A");
      
      // Buscar detalhes do plano de assinatura, se disponível
      let plan = null;
      if (subscriberData?.subscription_tier) {
        const { data: planData } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', subscriberData.subscription_tier)
          .single();
          
        if (planData) {
          console.log("Dados do plano encontrados:", planData);
          plan = planData;
        }
      }
      
      // Verificar se o subscription_end mudou e, em caso afirmativo, resetar a contagem de mensagens
      const storedSubscriptionEnd = localStorage.getItem(`subscription_end_${userData.user.id}`);
      const currentSubscriptionEnd = subscriberData?.subscription_end || '';
      
      if (storedSubscriptionEnd && storedSubscriptionEnd !== currentSubscriptionEnd) {
        console.log('Data de término da assinatura mudou, resetando contagem de mensagens');
        await resetMessageCount(userData.user.id);
      }
      
      // Armazenar subscription_end atual no localStorage para comparação futura
      localStorage.setItem(`subscription_end_${userData.user.id}`, currentSubscriptionEnd);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        subscribed: isActive,
        subscriptionTier: subscriberData?.subscription_tier || "Gratuito",
        subscriptionEnd: subscriberData?.subscription_end ? new Date(subscriberData.subscription_end) : null,
        messageLimit: plan?.message_limit || prev.messageLimit,
        plan: plan
      }));
      
      return isActive;
      
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      if (setState) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          subscribed: false
        }));
      }
      return false;
    }
  };

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
    console.log("Refreshing subscription data");
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
