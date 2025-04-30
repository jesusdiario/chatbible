
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProfileLayout from "@/components/profile/ProfileLayout";
import AccountSection from "@/components/profile/AccountSection";
import SubscriptionSection from "@/components/profile/SubscriptionSection";
import UsageSection from "@/components/profile/UsageSection";
import LanguageSection from "@/components/profile/LanguageSection";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  
  useEffect(() => {
    // Função para buscar dados do usuário
    const fetchUserData = async () => {
      try {
        // Obtém a sessão
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Erro na página de perfil:', error);
        toast({
          title: t('errors.loadProfile'),
          description: t('errors.general'),
          variant: "destructive"
        });
      } finally {
        // Defina loading como false independentemente do resultado
        setLoading(false);
      }
    };
    
    // Busca inicial dos dados do usuário
    fetchUserData();
    
    // Configura o listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });
    
    // Limpa a assinatura
    return () => {
      subscription.unsubscribe();
    };
  }, [toast, t]);

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
            {t('errors.notAuthenticated')}
          </AlertDescription>
        </Alert>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-8">
        <AccountSection user={user} />
        <LanguageSection />
        <UsageSection />
        <SubscriptionSection />
      </div>
    </ProfileLayout>
  );
};

export default Profile;
