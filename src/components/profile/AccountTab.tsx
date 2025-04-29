
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useFileUpload } from "@/hooks/useFileUpload";

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
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useFileUpload();

  const updateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          role: 'user',
          avatar_url: avatarUrl
        });
        
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file size (2MB max)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 2) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato não suportado",
        description: "Use imagens nos formatos JPG, PNG ou WebP.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const result = await uploadMutation.mutateAsync({ 
        file, 
        bookSlug: `profile-${user.id}` 
      });
      
      setAvatarUrl(result);
      
      // Update the user profile with the new avatar URL
      const { error } = await supabase
        .from('user_profiles')
        .update({ avatar_url: result })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      
      toast({
        title: "Redefinição de senha",
        description: "Enviamos um email com instruções para redefinir sua senha."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Conta</CardTitle>
        <CardDescription>Atualize suas informações pessoais</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url} />
            <AvatarFallback>{displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <input 
            type="file"
            id="avatar-upload"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
          />
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Enviando..." : "Alterar foto"}
          </Button>
          
          <p className="text-xs text-gray-500 text-center">
            Formatos recomendados: JPG, PNG, WebP. Tamanho máximo: 2MB.
          </p>
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">Nome</label>
          <Input
            id="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input
            id="email"
            value={user?.email || ''}
            disabled
            readOnly
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePasswordReset}>
          Alterar senha
        </Button>
        <Button onClick={updateProfile} disabled={isUpdating}>
          {isUpdating ? "Salvando..." : "Salvar alterações"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountTab;
