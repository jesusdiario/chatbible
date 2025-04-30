
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Customer, PricePlan } from '@/types/subscription';

export const useSubscriptionActions = (setState: Function) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Call the edge function to check subscription status
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");

      if (error) {
        console.error("Error checking subscription:", error);
        toast({
          title: "Erro ao verificar assinatura",
          description: "Não foi possível obter informações da sua assinatura.",
          variant: "destructive",
        });
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Fetch plan details if subscribed
      let plan: PricePlan | null = null;
      let customer: Customer | null = null;
      let usedMessages = 0;

      if (data.subscription_tier) {
        // Get plan details from price_plans table
        const { data: planData, error: planError } = await supabase
          .from('price_plans')
          .select('*')
          .eq('code', data.subscription_tier)
          .single();

        if (planError) {
          console.error("Error fetching plan:", planError);
        } else {
          plan = planData;
        }

        // Get customer details
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', session.session.user.id)
          .single();

        if (customerError) {
          console.error("Error fetching customer:", customerError);
        } else {
          customer = {
            ...customerData,
            current_period_end: customerData.current_period_end ? new Date(customerData.current_period_end) : null
          };
        }

        // Get current usage
        const { data: usageData } = await supabase
          .from('v_current_usage')
          .select('msgs_used')
          .eq('user_id', session.session.user.id)
          .single();

        if (usageData) {
          usedMessages = usageData.msgs_used || 0;
        }
      }

      setState({
        isLoading: false,
        subscribed: data.subscribed,
        subscriptionTier: data.subscription_tier,
        subscriptionEnd: data.subscription_end ? new Date(data.subscription_end) : null,
        messageLimit: data.message_limit || 10,
        plan,
        canSendMessage: data.can_send_message !== false,
        usedMessages,
        customer
      });
    } catch (error) {
      console.error("Error in checkSubscription:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const startCheckout = async (stripePriceId: string) => {
    try {
      setIsProcessing(true);
      
      const origin = window.location.origin;
      const successUrl = `${origin}/payment-success`;
      const cancelUrl = `${origin}/profile`;
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { 
          priceId: stripePriceId,
          successUrl,
          cancelUrl
        }
      });

      if (error) {
        throw error;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Erro no checkout",
        description: "Não foi possível iniciar o processo de pagamento.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.functions.invoke("customer-portal");

      if (error) {
        throw error;
      }

      // Redirect to Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal do cliente.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const trackUsage = async (usageType: string, amount: number, context?: any) => {
    try {
      const { data, error } = await supabase.functions.invoke("track-usage", {
        body: { 
          usage_type: usageType,
          amount,
          context
        }
      });

      if (error) {
        console.error("Error tracking usage:", error);
        return { success: false, error };
      }

      return data;
    } catch (error) {
      console.error("Error in trackUsage:", error);
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
