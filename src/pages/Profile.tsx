
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProfileLayout from "@/components/profile/ProfileLayout";
import AccountSection from "@/components/profile/AccountSection";
import SubscriptionSection from "@/components/profile/SubscriptionSection";
import UsageSection from "@/components/profile/UsageSection";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Verifica se existe uma sessão
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        // Obtém a sessão
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setLoading(false);
          return;
        }
        
        setUser(session.user);
      } catch (error) {
        console.error('Erro na página de perfil:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seus dados de perfil.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Configura o listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    // Busca inicial
    fetchUserData();
    
    // Limpa a assinatura
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </ProfileLayout>
    );
  }

  if (!user) {
    return (
      <ProfileLayout>
        <Alert>
          <AlertDescription>
            Você precisa estar logado para acessar esta página.
          </AlertDescription>
        </Alert>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-8">
        <AccountSection user={user} />
        <UsageSection />
        <SubscriptionSection />
      </div>
    </ProfileLayout>
  );
};

export default Profile;
