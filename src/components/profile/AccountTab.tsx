
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ProfileAvatar from "./ProfileAvatar";
import ProfileForm from "./ProfileForm";
import { useProfileManagement } from "@/hooks/useProfileManagement";

interface AccountTabProps {
  user: any;
  displayName: string;
  setDisplayName: (name: string) => void;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}

const AccountTab = ({ 
  user, 
  displayName, 
  setDisplayName,
  avatarUrl,
  setAvatarUrl 
}: AccountTabProps) => {
  const { updateProfile, handlePasswordReset, isUpdating } = useProfileManagement(user?.id);

  const saveChanges = async () => {
    await updateProfile({ displayName, avatarUrl });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Conta</CardTitle>
        <CardDescription>Atualize suas informações pessoais</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ProfileAvatar 
          userId={user?.id}
          avatarUrl={avatarUrl} 
          displayName={displayName}
          email={user?.email}
          onAvatarChange={setAvatarUrl}
        />
        
        <ProfileForm
          displayName={displayName}
          email={user?.email || ''}
          onDisplayNameChange={setDisplayName}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => handlePasswordReset(user?.email)}
        >
          Alterar senha
        </Button>
        <Button onClick={saveChanges} disabled={isUpdating}>
          {isUpdating ? "Salvando..." : "Salvar alterações"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountTab;
