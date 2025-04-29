
import { useState, useEffect } from 'react';

/**
 * Hook to fetch and track the user's session
 */
export const useUserSession = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    
    fetchUserSession();
    
    const { supabase } = require('@/integrations/supabase/client');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        setUserId(session?.user ? session.user.id : null);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { userId };
};
