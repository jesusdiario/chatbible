import React, { useState } from 'react';
import {
  MoreHorizontal,
  Trash2,
  ChevronRight,
  Pin,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatHistory } from '@/types/chat';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
                {chat.pinned ? 'Desafixar' : 'Fixar'}
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
          
          {isAccessible && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
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
              onClick={() => setIsRenameDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRename}
              disabled={isUpdating || !newTitle.trim() || newTitle === chat.title}
            >
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatHistoryItem;
