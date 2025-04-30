
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PricePlan, StripeItem } from '@/types/subscription';

export const useSubscriptionPlans = (subscriptionTier: string | null) => {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [stripeItems, setStripeItems] = useState<StripeItem[]>([]);

  // Load subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // Get all price plans
        const { data: planData, error: planError } = await supabase
          .from('price_plans')
          .select('*')
          .order('price_cents', { ascending: true });
        
        if (planError) throw planError;
        
        // Get stripe mappings
        const { data: stripeData, error: stripeError } = await supabase
          .from('stripe_items')
          .select('*');
          
        if (stripeError) throw stripeError;
        
        if (planData && stripeData) {
          // Format plans
          const formattedPlans = planData.map(plan => ({
            id: plan.id,
            code: plan.code,
            name: plan.name,
            description: plan.description,
            message_limit: plan.message_limit,
            price_cents: plan.price_cents,
            currency: plan.currency,
            period: plan.period,
            features: Array.isArray(plan.features) 
              ? plan.features 
              : typeof plan.features === 'string' 
                ? JSON.parse(plan.features) 
                : []
          } as PricePlan));
          
          setPlans(formattedPlans);
          setStripeItems(stripeData);
        }
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      }
    };
    
    fetchPlans();
  }, []);

  // Helper function to get stripe price ID for a plan
  const getStripePriceId = (planId: string): string | null => {
    const item = stripeItems.find(item => item.price_plan_id === planId);
    return item ? item.stripe_price_id : null;
  };

  return {
    plans,
    getStripePriceId
  };
};
