
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useProfileManagement(userId: string | undefined) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Função para solicitar redefinição de senha
  const handlePasswordReset = async (email: string) => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Email não fornecido",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth?reset=true',
      });
      
      if (error) throw error;
      
      toast({
        title: "Redefinição de senha",
        description: "Enviamos um email com instruções para redefinir sua senha."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar o email de redefinição de senha",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return { 
    handlePasswordReset,
    isUpdating 
  };
}
