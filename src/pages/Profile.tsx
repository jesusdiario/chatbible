
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
    // Check if there's a session
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        // Get the session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setLoading(false);
          return;
        }
        
        setUser(session.user);
        
        // Get user profile data
        const { data, error } = await supabase
          .from('user_profiles')
          .select('display_name, avatar_url')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
            toast({
              title: "Erro ao carregar perfil",
              description: "Não foi possível carregar seus dados de perfil.",
              variant: "destructive"
            });
          }
        } else if (data) {
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (error) {
        console.error('Error in profile page:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up auth state change listener
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
    
    // Initial fetch
    fetchUserData();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Get the active tab from URL query params
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
