
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2 } from "lucide-react";

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  displayName: string;
  onAvatarChange: (url: string | null) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  userId, 
  avatarUrl, 
  displayName, 
  onAvatarChange 
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `profile-${userId}.${fileExt}`;
      
      // Check if avatars bucket exists
      const { data: buckets } = await supabase
        .storage
        .listBuckets();
      
      const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarsBucketExists) {
        toast({
          title: "Erro",
          description: "Bucket 'avatars' não existe. Contate o administrador.",
          variant: "destructive"
        });
        return;
      }

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast({
          title: "Erro ao fazer upload",
          description: uploadError.message,
          variant: "destructive"
        });
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Update profile with new avatar URL using RPC
      const { error: updateError } = await supabase.rpc(
        'update_user_avatar', 
        { 
          user_id_param: userId, 
          avatar_url_param: publicUrl 
        }
      );

      if (updateError) {
        toast({
          title: "Erro ao atualizar perfil",
          description: updateError.message,
          variant: "destructive"
        });
        return;
      }

      onAvatarChange(publicUrl);
      toast({
        title: "Sucesso",
        description: "Avatar atualizado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);
      
      // Update profile to remove avatar URL using RPC
      const { error } = await supabase.rpc(
        'update_user_avatar', 
        { 
          user_id_param: userId, 
          avatar_url_param: null 
        }
      );

      if (error) {
        throw error;
      }

      onAvatarChange(null);
      toast({
        title: "Sucesso",
        description: "Avatar removido com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-2xl">
          {displayName?.charAt(0).toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => document.getElementById('avatar-upload')?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Alterar imagem
        </Button>
        
        {avatarUrl && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2 text-red-500 hover:text-red-600"
            onClick={removeAvatar}
            disabled={uploading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AvatarUpload;
