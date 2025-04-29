
import React, { useState } from 'react';
import {
  MoreHorizontal,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatHistory } from '@/types/chat';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
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
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatHistoryItemProps {
  chat: ChatHistory;
  onSelect: (slug: string) => void;
  onDelete: (id: string) => void;
  isAccessible?: boolean;
}

const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({ 
  chat, 
  onSelect, 
  onDelete,
  isAccessible = true 
}) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
            <p className="text-sm font-medium text-gray-800 truncate">{chat.title}</p>
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
    </>
  );
};

export default ChatHistoryItem;
