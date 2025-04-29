
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

interface AccountSectionProps {
  user: any;
}

const AccountSection = ({ user }: AccountSectionProps) => {
  const { handlePasswordReset } = useProfileManagement(user?.id);

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Por favor, faça login para acessar seu perfil.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Conta</h2>
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>Suas informações de acesso</CardDescription>
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
            >
              Alterar senha
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSection;
