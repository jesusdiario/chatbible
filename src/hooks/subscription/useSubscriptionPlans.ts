
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan } from '@/types/subscription';

export const useSubscriptionPlans = (subscriptionTier: string | null) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  // Load subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_amount', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          // Convert data to correct SubscriptionPlan format
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

  return plans;
};
