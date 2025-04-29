
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { supabase } from "@/integrations/supabase/client";

interface ProfileAvatarProps {
  userId: string;
  avatarUrl: string | null;
  displayName: string;
  email?: string;
  onAvatarChange: (url: string | null) => void;
}

const ProfileAvatar = ({ userId, avatarUrl, displayName, email, onAvatarChange }: ProfileAvatarProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useFileUpload();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
    setIsUploading(true);
    try {
      // Upload o arquivo usando nosso hook
      const fileNamePrefix = `profile-${userId}`;
      const publicUrl = await uploadMutation.mutateAsync({ 
        file, 
        fileNamePrefix,
        bucket: 'avatars'
      });
      
      // Atualiza o perfil do usuário com a nova URL do avatar
      // Usando .eq() para garantir que estamos atualizando apenas o perfil do usuário atual
      const { error } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);
      
      if (error) {
        console.error('Erro ao atualizar avatar no perfil:', error);
        throw error;
      }
      
      // Chama o callback para atualizar o estado no componente pai
      onAvatarChange(publicUrl);
      
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao fazer upload",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      // Limpa o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} alt={displayName || "Profile"} />
        <AvatarFallback>{displayName?.charAt(0) || email?.charAt(0)}</AvatarFallback>
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
        disabled={isUploading || uploadMutation.isPending}
      >
        {isUploading || uploadMutation.isPending ? "Enviando..." : "Alterar foto"}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Formatos recomendados: JPG, PNG, WebP. Tamanho máximo: 2MB.
      </p>
    </div>
  );
};

export default ProfileAvatar;
