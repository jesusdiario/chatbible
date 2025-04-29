
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionPlan } from './types';

export const useSubscriptionPlans = (subscriptionTier: string | null) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

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

  return plans;
};
