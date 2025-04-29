
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RenameDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title: string;
  newTitle: string;
  setNewTitle: (title: string) => void;
  isUpdating: boolean;
  onRename: () => void;
}

const RenameDialog: React.FC<RenameDialogProps> = ({
  isOpen,
  setIsOpen,
  title,
  newTitle,
  setNewTitle,
  isUpdating,
  onRename,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renomear conversa</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Novo título"
            className="w-full"
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUpdating}
          >
            Cancelar
          </Button>
          <Button
            onClick={onRename}
            disabled={isUpdating || !newTitle.trim() || newTitle === title}
          >
            {isUpdating ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameDialog;
