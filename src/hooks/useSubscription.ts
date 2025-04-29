
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  message_limit: number;
  features: string[];
  price_amount: number;
  price_currency: string;
  stripe_price_id: string;
}

interface SubscriptionState {
  isLoading: boolean;
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: Date | null;
  messageLimit: number;
  plan: SubscriptionPlan | null;
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    subscribed: false,
    subscriptionTier: null,
    subscriptionEnd: null,
    messageLimit: 10, // Padrão para plano gratuito
    plan: null
  });
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const { toast } = useToast();

  // Carregar planos de assinatura
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_amount', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          // Converter os dados para o formato correto de SubscriptionPlan
          const formattedPlans = data.map(plan => ({
            ...plan,
            features: Array.isArray(plan.features) 
              ? plan.features 
              : typeof plan.features === 'string' 
                ? JSON.parse(plan.features) 
                : []
          } as SubscriptionPlan));
          
          setPlans(formattedPlans);
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      }
    };
    
    fetchPlans();
  }, []);

  // Verificar status da assinatura
  const checkSubscription = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        throw error;
      }
      
      setState({
        isLoading: false,
        subscribed: data.subscribed || false,
        subscriptionTier: data.subscription_tier || "Gratuito",
        subscriptionEnd: data.subscription_end ? new Date(data.subscription_end) : null,
        messageLimit: data.message_limit || 10,
        plan: data.subscription_data
      });
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar seu status de assinatura",
        variant: "destructive",
      });
      setState(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
    }
  };

  // Iniciar checkout do Stripe
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

  // Abrir portal do cliente
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

  // Verificar assinatura quando componente montar
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        checkSubscription();
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    checkAuth();

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkSubscription();
      } else if (event === 'SIGNED_OUT') {
        setState({
          isLoading: false,
          subscribed: false,
          subscriptionTier: null,
          subscriptionEnd: null,
          messageLimit: 10,
          plan: null
        });
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return {
    ...state,
    plans,
    checkSubscription,
    startCheckout,
    openCustomerPortal,
    refreshSubscription: checkSubscription
  };
};
