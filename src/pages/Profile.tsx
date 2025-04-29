
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileLayout from "@/components/profile/ProfileLayout";
import AccountTab from "@/components/profile/AccountTab";
import SubscriptionTab from "@/components/profile/SubscriptionTab";
import UsageTab from "@/components/profile/UsageTab";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        const { data } = await supabase
          .from('user_profiles')
          .select('display_name, avatar_url')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          setDisplayName(data.display_name || "");
        }
      }
    };
    
    fetchUserData();
  }, []);

  // Get the active tab from URL query params
  const getActiveTab = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'account';
  };

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
