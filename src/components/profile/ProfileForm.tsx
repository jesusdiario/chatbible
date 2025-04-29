
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileFormProps {
  userId: string;
  displayName: string;
  email: string;
  onDisplayNameChange: (value: string) => void;
  isUpdating?: boolean;
}

const ProfileForm = ({ 
  userId, 
  displayName, 
  email, 
  onDisplayNameChange,
  isUpdating = false 
}: ProfileFormProps) => {
  const [editableName, setEditableName] = React.useState(displayName);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  // Atualiza o estado local quando as props mudam (ex: quando os dados são carregados do DB)
  React.useEffect(() => {
    setEditableName(displayName);
  }, [displayName]);

  const handleSaveName = async () => {
    if (editableName === displayName || !userId) return;
    
    setIsSaving(true);
    try {
      // Atualiza explicitamente pelo ID para garantir que as políticas de RLS sejam respeitadas
      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: editableName })
        .eq('id', userId);
      
      if (error) {
        console.error('Erro ao atualizar nome:', error);
        throw error;
      }
      
      onDisplayNameChange(editableName);
      
      toast({
        title: "Nome atualizado",
        description: "Seu nome de exibição foi atualizado com sucesso."
      });
    } catch (error: any) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro ao atualizar nome",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium">Nome</label>
        <div className="flex gap-2">
          <Input
            id="name"
            value={editableName}
            onChange={(e) => setEditableName(e.target.value)}
            placeholder="Seu nome"
            disabled={isSaving || isUpdating}
          />
          {editableName !== displayName && (
            <Button 
              onClick={handleSaveName} 
              disabled={isSaving || isUpdating}
              size="sm"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input
          id="email"
          value={email || ''}
          disabled
          readOnly
        />
      </div>
    </>
  );
};

export default ProfileForm;
