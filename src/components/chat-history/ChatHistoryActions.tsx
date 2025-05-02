
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Pin, Trash2 } from 'lucide-react';
import { ChatHistory } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { updateChatTitle, deleteChat } from '@/services/persistenceService';
import DeleteDialog from './DeleteDialog';
import RenameDialog from './RenameDialog';

interface ChatHistoryActionsProps {
  chat: ChatHistory;
  isAccessible: boolean;
  onDelete: (id: string) => void;
  onTogglePin: () => void;
  isPerformingAction: boolean;
  setIsPerformingAction: React.Dispatch<React.SetStateAction<boolean>>;
  onHistoryUpdated?: () => void;
}

const ChatHistoryActions: React.FC<ChatHistoryActionsProps> = ({
  chat,
  isAccessible,
  onDelete,
  onTogglePin,
  isPerformingAction,
  setIsPerformingAction,
  onHistoryUpdated
}) => {
  const { toast } = useToast();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setNewTitle(chat.title);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isPerformingAction) return;
    
    try {
      setIsPerformingAction(true);
      const success = await deleteChat(chat.id);
      
      if (success) {
        toast({
          title: "Conversa excluída",
          description: "A conversa foi removida do seu histórico.",
        });
        
        onDelete(chat.id);
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error("Falha ao excluir conversa");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleRename = async () => {
    if (isPerformingAction) return;
    
    try {
      setIsPerformingAction(true);
      
      if (!newTitle.trim() || newTitle === chat.title) {
        setIsRenaming(false);
        return;
      }
      
      const success = await updateChatTitle(chat.slug || '', newTitle);
      
      if (success) {
        toast({
          title: "Conversa renomeada",
          description: "O título da conversa foi atualizado.",
        });
        
        if (onHistoryUpdated) {
          onHistoryUpdated();
        }
      } else {
        throw new Error("Falha ao renomear conversa");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível renomear a conversa. Tente novamente.",
        variant: "destructive",
      });
      setNewTitle(chat.title);
    } finally {
      setIsPerformingAction(false);
      setIsRenaming(false);
    }
  };

  if (!isAccessible) {
    return (
      <div className="mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs px-2 py-1 h-auto text-chatgpt-accent hover:text-chatgpt-accent/80"
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = '/profile?tab=subscription';
          }}
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 mt-3 text-gray-500">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto hover:bg-transparent hover:text-gray-700 font-normal"
          onClick={handleStartRename}
          disabled={isPerformingAction}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Renomear
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="p-0 h-auto hover:bg-transparent hover:text-gray-700 font-normal"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          disabled={isPerformingAction}
        >
          <Pin className="h-4 w-4 mr-1" />
          {chat.pinned ? 'Desafixar' : 'Fixar'}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="p-0 h-auto hover:bg-transparent hover:text-red-500 font-normal"
          onClick={handleDelete}
          disabled={isPerformingAction}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Excluir
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        isDeleting={isPerformingAction}
        onDelete={handleConfirmDelete}
      />

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={isRenaming}
        setIsOpen={setIsRenaming}
        title={chat.title}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        isUpdating={isPerformingAction}
        onRename={handleRename}
      />
    </>
  );
};

export default ChatHistoryActions;
