
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface AccountSectionProps {
  user: any;
}

const AccountSection = ({ user }: AccountSectionProps) => {
  const { handlePasswordReset, isUpdating } = useProfileManagement(user?.id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: t('errors.logout'),
        description: error.message || t('errors.general'),
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {t('errors.notAuthenticated')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{t('profile.account')}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.accountInfo')}</CardTitle>
          <CardDescription>{t('profile.accountInfo')}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              value={user.email || ''}
              disabled
              readOnly
            />
          </div>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={() => handlePasswordReset(user.email)}
              disabled={isUpdating}
            >
              {isUpdating ? t('profile.processing') : t('profile.changePassword')}
            </Button>
          </div>

          <div className="mt-2">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <LogOut size={16} />
              {t('profile.logout')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSection;
