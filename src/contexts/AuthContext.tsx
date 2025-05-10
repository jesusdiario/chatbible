
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  subscriptionStatus: {
    isSubscribed: boolean;
    isLoading: boolean;
    limitExceeded: boolean;
    tier: string | null;
  };
  checkSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    isSubscribed: false,
    isLoading: true,
    limitExceeded: false,
    tier: null as string | null,
  });
  const { toast } = useToast();

  // Check if user has exceeded their message limit
  const checkSubscriptionStatus = async () => {
    try {
      if (!user) return;
      
      setSubscriptionStatus(prev => ({ ...prev, isLoading: true }));
      
      // Fetch subscription details
      const { data: subData, error: subError } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier')
        .eq('user_id', user.id)
        .single();
        
      if (subError && subError.code !== 'PGRST116') {
        console.error("Error fetching subscription:", subError);
        return;
      }
      
      const isSubscribed = subData?.subscribed || false;
      const tier = subData?.subscription_tier || 'Gratuito';
      
      // If user is subscribed, they're never limited
      if (isSubscribed) {
        setSubscriptionStatus({
          isSubscribed: true,
          isLoading: false,
          limitExceeded: false,
          tier
        });
        return;
      }
      
      // For free users, check if they've exceeded message limit
      const { data: msgData, error: msgError } = await supabase
        .from('message_counts')
        .select('count')
        .eq('user_id', user.id)
        .single();
        
      if (msgError && msgError.code !== 'PGRST116') {
        console.error("Error fetching message count:", msgError);
        return;
      }
      
      // Get free tier message limit
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('message_limit')
        .eq('name', 'Gratuito')
        .single();
        
      const messageLimit = planData?.message_limit || 10;
      const currentCount = msgData?.count || 0;
      
      setSubscriptionStatus({
        isSubscribed,
        isLoading: false,
        limitExceeded: currentCount >= messageLimit,
        tier
      });
      
    } catch (error) {
      console.error("Error checking subscription status:", error);
      setSubscriptionStatus(prev => ({ 
        ...prev, 
        isLoading: false 
      }));
    }
  };

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Check subscription status if user is logged in
        if (data.session?.user) {
          await checkSubscriptionStatus();
        }
      } catch (error) {
        console.error('Error getting auth session:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar sua sessão',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);
      
      // On sign-in, check subscription
      if (event === 'SIGNED_IN' && newSession?.user) {
        await checkSubscriptionStatus();
      }
      
      // On sign-out, reset subscription status
      if (event === 'SIGNED_OUT') {
        setSubscriptionStatus({
          isSubscribed: false,
          isLoading: false,
          limitExceeded: false,
          tier: null
        });
      }
      
      setLoading(false);
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [toast]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setSubscriptionStatus({
        isSubscribed: false,
        isLoading: false,
        limitExceeded: false,
        tier: null
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível encerrar a sessão',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signOut, 
      subscriptionStatus, 
      checkSubscriptionStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
