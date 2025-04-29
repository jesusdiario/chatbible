
import React, { useState } from 'react';
import { ChevronRight, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatHistory } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DeleteDialog from './DeleteDialog';
import RenameDialog from './RenameDialog';
import ChatHistoryActionsMenu from './ChatHistoryActionsMenu';

interface ChatHistoryItemProps {
  chat: ChatHistory;
  onSelect: (slug: string) => void;
  onDelete: (id: string) => void;
  onHistoryUpdated?: () => void;
  isAccessible?: boolean;
}

const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({ 
  chat, 
  onSelect, 
  onDelete,
  onHistoryUpdated,
  isAccessible = true 
}) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = () => {
    if (!isAccessible) {
      toast({
        title: "Acesso restrito",
        description: "Faça upgrade para o plano premium para acessar o histórico completo.",
        variant: "destructive",
      });
      return;
    }
    onSelect(chat.slug || '');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Marcar como excluído no banco de dados
      const { error } = await supabase
        .from('chat_history')
        .update({ is_deleted: true })
        .eq('id', chat.id);
        
      if (error) throw error;
      
      onDelete(chat.id);
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
      
      const { error } = await supabase
        .from('chat_history')
        .update({ pinned: !chat.pinned })
        .eq('id', chat.id);
        
      if (error) throw error;
      
      toast({
        title: chat.pinned ? "Chat desafixado" : "Chat fixado",
        description: chat.pinned ? "O chat foi removido dos fixados." : "O chat foi adicionado aos fixados.",
      });
      
      if (onHistoryUpdated) {
        onHistoryUpdated();
      }
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
    if (!newTitle.trim() || newTitle === chat.title) {
      setIsRenameDialogOpen(false);
      return;
    }
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('chat_history')
        .update({ title: newTitle })
        .eq('id', chat.id);
        
      if (error) throw error;
      
      toast({
        title: "Chat renomeado",
        description: "O título do chat foi atualizado.",
      });
      
      if (onHistoryUpdated) {
        onHistoryUpdated();
      }
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
      <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
        isAccessible ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-70'
      }`}>
        <div 
          className="flex-1 min-w-0"
          onClick={handleSelect}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {chat.pinned && <Pin className="h-3 w-3 text-blue-600" />}
              <p className="text-sm font-medium text-gray-800 truncate">{chat.title}</p>
            </div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(chat.lastAccessed), { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
          
          {chat.last_message && (
            <p className="text-xs text-gray-500 truncate">{chat.last_message}</p>
          )}
        </div>
        
        <div className="flex items-center">
          {!isAccessible && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2 text-xs px-2 py-1 h-auto"
              onClick={() => window.location.href = '/profile?tab=subscription'}
            >
              Upgrade
            </Button>
          )}
          
          <ChatHistoryActionsMenu
            isPinned={!!chat.pinned}
            isUpdating={isUpdating}
            onRename={() => setIsRenameDialogOpen(true)}
            onTogglePin={handleTogglePin}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
          
          {isAccessible && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      
      <DeleteDialog 
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />
      
      <RenameDialog
        isOpen={isRenameDialogOpen}
        setIsOpen={setIsRenameDialogOpen}
        title={chat.title}
        newTitle={newTitle}
        setNewTitle={setNewTitle}
        isUpdating={isUpdating}
        onRename={handleRename}
      />
    </>
  );
};

export default ChatHistoryItem;
