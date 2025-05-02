
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Pin, Edit } from 'lucide-react';
import DeleteDialog from './DeleteDialog';
import RenameDialog from './RenameDialog';
import { deleteChat, updateChatTitle, toggleChatPin } from '@/services/persistenceService';
import { useToast } from '@/hooks/use-toast';

interface ChatHistoryActionsMenuProps {
  chatId: string;
  slug: string;
  title: string;
  isPinned: boolean;
  onDelete: (chatId: string) => void;
  onHistoryUpdated: () => void;
}

const ChatHistoryActionsMenu: React.FC<ChatHistoryActionsMenuProps> = ({
  chatId,
  slug,
  title,
  isPinned,
  onDelete,
  onHistoryUpdated
}) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      const success = await deleteChat(chatId);
      
      if (!success) throw new Error("Falha ao excluir o chat");
      
      onDelete(chatId);
      toast({
        title: "Chat excluído",
        description: "O chat foi removido do seu histórico.",
      });
    } catch (error) {
      console.error('Erro ao excluir chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o chat. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      setIsUpdating(true);
      
      const success = await toggleChatPin(slug, !isPinned);
      
      if (!success) throw new Error("Falha ao atualizar status fixado");
      
      toast({
        title: isPinned ? "Chat desafixado" : "Chat fixado",
        description: isPinned ? "O chat foi removido dos fixados." : "O chat foi adicionado aos fixados.",
      });
      
      onHistoryUpdated();
    } catch (error) {
      console.error('Erro ao fixar/desafixar chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do chat. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === title) {
      setIsRenameDialogOpen(false);
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const success = await updateChatTitle(slug, newTitle);
      
      if (!success) throw new Error("Falha ao renomear o chat");
      
      toast({
        title: "Chat renomeado",
        description: "O título do chat foi atualizado.",
      });
      
      onHistoryUpdated();
    } catch (error) {
      console.error('Erro ao renomear chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível renomear o chat. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsRenameDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => setIsRenameDialogOpen(true)}
            disabled={isUpdating}
          >
            <Edit className="h-4 w-4 mr-2" />
            Renomear
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleTogglePin}
            disabled={isUpdating}
          >
            <Pin className="h-4 w-4 mr-2" />
            {isPinned ? 'Desafixar' : 'Fixar'}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />
      
      <RenameDialog
        isOpen={isRenameDialogOpen}
        setIsOpen={setIsRenameDialogOpen}
        title={title}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        isUpdating={isUpdating}
        onRename={handleRename}
      />
    </>
  );
};

export default ChatHistoryActionsMenu;
