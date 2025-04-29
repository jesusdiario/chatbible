
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useProfileManagement(userId: string | undefined) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Função centralizada para atualizar o perfil do usuário
  const updateProfile = async (data: { 
    displayName?: string, 
    avatarUrl?: string | null 
  }) => {
    if (!userId) return;
    
    setIsUpdating(true);
    try {
      // Preparar os dados para atualização, incluindo apenas campos que foram fornecidos
      const updateData: { 
        id: string;
        display_name?: string;
        avatar_url?: string | null;
        role: string;  // O campo role é obrigatório
      } = {
        id: userId,
        role: 'user'  // Valor padrão necessário
      };

      // Adicionar campos opcionais apenas se fornecidos
      if (data.displayName !== undefined) {
        updateData.display_name = data.displayName;
      }

      if (data.avatarUrl !== undefined) {
        updateData.avatar_url = data.avatarUrl;
      }
      
      // Usando upsert para criar o perfil se não existir ou atualizar se existir
      const { error } = await supabase
        .from('user_profiles')
        .upsert(updateData, {
          onConflict: 'id'
        });
        
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Função específica para atualizar apenas o nome
  const updateDisplayName = async (displayName: string) => {
    return await updateProfile({ displayName });
  };

  // Função específica para atualizar apenas o avatar
  const updateAvatarUrl = async (avatarUrl: string | null) => {
    return await updateProfile({ avatarUrl });
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

  return { 
    updateProfile, 
    updateDisplayName,
    updateAvatarUrl,
    handlePasswordReset, 
    isUpdating 
  };
}
