
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfileManagement } from "@/hooks/useProfileManagement";

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
  const { updateDisplayName } = useProfileManagement(userId);

  // Atualiza o estado local quando as props mudam (ex: quando os dados são carregados do DB)
  React.useEffect(() => {
    setEditableName(displayName);
  }, [displayName]);

  const handleSaveName = async () => {
    if (editableName === displayName || !userId) return;
    
    setIsSaving(true);
    try {
      const success = await updateDisplayName(editableName);
      
      if (success) {
        onDisplayNameChange(editableName);
      }
    } catch (error) {
      console.error('Erro ao salvar o nome:', error);
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
