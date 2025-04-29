
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useProfileManagement(userId: string | undefined) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (data: { displayName: string, avatarUrl: string | null }) => {
    if (!userId) return;
    
    setIsUpdating(true);
    try {
      // Usando upsert para criar o perfil se não existir ou atualizar se existir
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          display_name: data.displayName,
          avatar_url: data.avatarUrl
        }, {
          onConflict: 'id'
        });
        
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    if (!email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
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

  return { updateProfile, handlePasswordReset, isUpdating };
}
