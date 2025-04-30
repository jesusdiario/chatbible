
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PricePlan } from '@/types/subscription';

export const useSubscriptionPlans = (currentTier: string | null) => {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [stripeItems, setStripeItems] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const loadPlans = async () => {
      try {
        // Fetch price plans
        const { data: planData, error: planError } = await supabase
          .from('price_plans')
          .select('*')
          .order('price_cents');

        if (planError) {
          console.error("Error fetching price plans:", planError);
          return;
        }

        // Fetch stripe items
        const { data: stripeData, error: stripeError } = await supabase
          .from('stripe_items')
          .select('*');

        if (stripeError) {
          console.error("Error fetching stripe items:", stripeError);
          return;
        }
        
        // Build price ID map
        const priceMap: Record<string, string> = {};
        stripeData?.forEach(item => {
          priceMap[item.price_plan_id] = item.stripe_price_id;
        });
        
        setStripeItems(priceMap);
        
        // Process plans
        const processedPlans = planData?.map(plan => ({
          id: plan.id,
          code: plan.code,
          name: plan.name,
          description: plan.description,
          period: plan.period,
          message_limit: plan.message_limit,
          price_cents: plan.price_cents,
          currency: plan.currency,
          features: Array.isArray(plan.features) ? plan.features : []
        }));
        
        setPlans(processedPlans || []);
      } catch (error) {
        console.error("Error loading plans:", error);
      }
    };
    
    loadPlans();
  }, [currentTier]);
  
  // Helper function to get the Stripe price ID for a plan
  const getStripePriceId = (planId: string) => {
    return stripeItems[planId] || null;
  };
  
  return { plans, getStripePriceId };
};
