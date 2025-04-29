
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileLayout from "@/components/profile/ProfileLayout";
import AccountTab from "@/components/profile/AccountTab";
import SubscriptionTab from "@/components/profile/SubscriptionTab";
import UsageTab from "@/components/profile/UsageTab";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
        
        // Obtém os dados do perfil do usuário
        const { data, error } = await supabase
          .from('user_profiles')
          .select('display_name, avatar_url')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil de usuário:', error);
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar seus dados de perfil.",
            variant: "destructive"
          });
        } else if (data) {
          // Perfil existe
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url || null);
        } else {
          // Perfil não existe, insere os dados iniciais
          const defaultName = session.user.email?.split('@')[0] || "";
          setDisplayName(defaultName);
          
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: session.user.id,
              display_name: defaultName,
              role: 'user'
            });
            
          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            toast({
              title: "Erro ao criar perfil",
              description: "Não foi possível criar seu perfil. Por favor, tente novamente.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Erro na página de perfil:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Configura o listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        fetchUserData();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setDisplayName("");
        setAvatarUrl(null);
      }
    });
    
    // Busca inicial
    fetchUserData();
    
    // Limpa a assinatura
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Obtém a aba ativa a partir dos parâmetros de consulta da URL
  const getActiveTab = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'account';
  };

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
      <Tabs defaultValue={getActiveTab()}>
        <TabsList className="mb-4">
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <AccountTab 
            user={user}
            displayName={displayName}
            setDisplayName={setDisplayName}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
          />
        </TabsContent>
        
        <TabsContent value="subscription">
          <SubscriptionTab />
        </TabsContent>
        
        <TabsContent value="usage">
          <UsageTab />
        </TabsContent>
      </Tabs>
    </ProfileLayout>
  );
};

export default Profile;
