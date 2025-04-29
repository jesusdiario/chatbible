
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Pin, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatHistoryActionsMenuProps {
  chatId: string;
  title: string;
  pinned: boolean;
  slug?: string;
  onDelete: () => void;
  onHistoryUpdated?: () => void;
  isAccessible?: boolean;
}

const ChatHistoryActionsMenu: React.FC<ChatHistoryActionsMenuProps> = ({
  chatId,
  title,
  pinned,
  slug,
  onDelete,
  onHistoryUpdated,
  isAccessible = true
}) => {
  const [isUpdating, setIsUpdating] = React.useState(false);
  
  const handleTogglePin = async () => {
    if (!isAccessible) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('chat_history')
        .update({ pinned: !pinned })
        .eq('id', chatId);
        
      if (error) throw error;
      
      if (onHistoryUpdated) {
        onHistoryUpdated();
      }
    } catch (error) {
      console.error('Error toggling pin status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => {
            // This would open a rename dialog in the parent component
            // The parent is responsible for implementing this
            onHistoryUpdated?.();
          }}
          disabled={isUpdating || !isAccessible}
        >
          <Edit className="h-4 w-4 mr-2" />
          Renomear
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleTogglePin}
          disabled={isUpdating || !isAccessible}
        >
          <Pin className="h-4 w-4 mr-2" />
          {pinned ? 'Desafixar' : 'Fixar'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600" 
          onClick={onDelete}
          disabled={!isAccessible}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatHistoryActionsMenu;
