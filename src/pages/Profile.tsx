
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProfileLayout from "@/components/profile/ProfileLayout";
import AccountSection from "@/components/profile/AccountSection";
import SubscriptionSection from "@/components/profile/SubscriptionSection";
import LanguageSection from "@/components/profile/LanguageSection";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          
          // Fetch user profile data using RPC
          const { data: profileData, error: profileError } = await supabase
            .rpc('get_user_profile', { user_id_param: session.user.id });
          
          if (!profileError && profileData) {
            setUserProfile({
              display_name: profileData.display_name,
              avatar_url: profileData.avatar_url
            });
          } else {
            console.error('Profile fetch error:', profileError);
            setUserProfile({
              display_name: session.user.email?.split('@')[0] || null,
              avatar_url: null
            });
          }
        }
      } catch (error) {
        console.error("Erro na página de perfil:", error);
        toast({
          title: t("errors.loadProfile"),
          description: t("errors.general"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast, t]);

  const handleAvatarChange = (url: string | null) => {
    setUserProfile(prev => prev ? { ...prev, avatar_url: url } : { display_name: null, avatar_url: url });
  };

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      </ProfileLayout>
    );
  }

  if (!user) {
    return (
      <ProfileLayout>
        <Alert>
          <AlertDescription>{t("errors.notAuthenticated")}</AlertDescription>
        </Alert>
      </ProfileLayout>
    );
  }

  return (
    <ProfileLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("profile.profileInfo")}</CardTitle>
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <AvatarUpload 
                userId={user.id}
                avatarUrl={userProfile?.avatar_url || null}
                displayName={userProfile?.display_name || user.email?.split('@')[0] || ''}
                onAvatarChange={handleAvatarChange}
              />
            </div>
          </CardContent>
        </Card>
        
        <AccountSection user={user} />
        <LanguageSection />
        <SubscriptionSection />
      </div>
    </ProfileLayout>
  );
};

export default Profile;
