
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[AuthContext] Initializing auth...');
    let authListenerUnsubscribe: (() => void) | undefined;
    
    // Set up auth state listener BEFORE checking session
    const setupAuthListener = async () => {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('[AuthContext] Auth state changed:', event);
        
        // Update session and user state
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Só definimos loading como false quando temos um evento de auth state change
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      });

      authListenerUnsubscribe = authListener.subscription.unsubscribe;
    };

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('[AuthContext] Getting initial session');
        // Configuramos o listener primeiro
        await setupAuthListener();
        
        // Depois verificamos a sessão
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] Error getting session:', error);
          throw error;
        }
        
        console.log('[AuthContext] Initial session:', !!data.session);
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Garantir que loading é definido como false após a verificação inicial
        setLoading(false);
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar sua sessão',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      console.log('[AuthContext] Cleaning up auth listener');
      if (authListenerUnsubscribe) {
        authListenerUnsubscribe();
      }
    };
  }, [toast]);

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('[AuthContext] Signing out');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[AuthContext] Error signing out:', error);
        throw error;
      }
      
      // Clear user data
      setUser(null);
      setSession(null);
      
      // Clear subscription cache
      localStorage.removeItem('user_subscription_status');
      localStorage.removeItem('user_subscription_tier');
      
      console.log('[AuthContext] Sign out successful');
    } catch (error) {
      console.error('[AuthContext] Error during sign out:', error);
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
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
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
