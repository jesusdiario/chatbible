
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserSession = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        setIsLoading(true);
        
        // Obter sessão atual do Supabase
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user) {
          setUserId(data.session.user.id);
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.error('Erro ao obter sessão:', error);
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Setup listener para mudanças de autenticação
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { userId, isLoading };
};

export default useUserSession;
