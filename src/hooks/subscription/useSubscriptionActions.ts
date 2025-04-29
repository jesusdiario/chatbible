
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionState } from './types';

export const useSubscriptionActions = (setState: (state: React.SetStateAction<SubscriptionState>) => void) => {
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Podemos tentar primeiro buscar diretamente da tabela de subscribers
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();
      
      if (subscriberError) {
        console.log("Não foi possível encontrar dados de assinatura na tabela, verificando via Edge Function");
        // Fallback para a edge function
        const { data: functionData, error: functionError } = await supabase.functions.invoke('check-subscription');
        
        if (functionError) throw functionError;
        
        setState({
          isLoading: false,
          subscribed: functionData.subscribed || false,
          subscriptionTier: functionData.subscription_tier || "Gratuito",
          subscriptionEnd: functionData.subscription_end ? new Date(functionData.subscription_end) : null,
          messageLimit: functionData.message_limit || 10,
          plan: functionData.subscription_data || null,
          subscription_data: functionData
        });
        
        return;
      }
      
      // Se encontrou dados na tabela subscribers
      const isActive = subscriberData.subscribed && 
                      (subscriberData.subscription_end ? new Date(subscriberData.subscription_end) > new Date() : false);
      
      setState(prev => ({
        isLoading: false,
        subscribed: isActive,
        subscriptionTier: subscriberData.subscription_tier || "Gratuito",
        subscriptionEnd: subscriberData.subscription_end ? new Date(subscriberData.subscription_end) : null,
        messageLimit: prev.messageLimit, // Será atualizado pelo hook que gerencia os planos
        plan: null, // Será atualizado pelo hook que gerencia os planos
        subscription_data: subscriberData
      }));
      
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      // Não mostrar toast de erro para não interromper a experiência do usuário
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
    }
  };

  const startCheckout = async (priceId: string, successUrl?: string, cancelUrl?: string) => {
    try {
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
    }
  };

  const openCustomerPortal = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
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
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    checkSubscription,
    startCheckout,
    openCustomerPortal
  };
};
