
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useFileUpload();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
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
        bookSlug: `profile-${userId}` 
      });
      
      onAvatarChange(result);
      
      // Update the user profile with the new avatar URL
      const { error } = await supabase
        .from('user_profiles')
        .update({ avatar_url: result })
        .eq('id', userId);
      
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

  return (
    <div className="flex flex-col items-center space-y-2">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} />
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
        disabled={isUploading}
      >
        {isUploading ? "Enviando..." : "Alterar foto"}
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Formatos recomendados: JPG, PNG, WebP. Tamanho máximo: 2MB.
      </p>
    </div>
  );
};

export default ProfileAvatar;
