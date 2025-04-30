
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

interface ChatHistoryActionsMenuProps {
  chatId: string;
  onDelete: (chatId: string) => void;
  onHistoryUpdated: () => void;
}

const ChatHistoryActionsMenu: React.FC<ChatHistoryActionsMenuProps> = ({
  chatId,
  onDelete,
  onHistoryUpdated
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => console.log('Renomear')}>
          <Edit className="h-4 w-4 mr-2" />
          Renomear
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => console.log('Toggle pin')}>
          <Pin className="h-4 w-4 mr-2" />
          Fixar
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600" 
          onClick={() => onDelete(chatId)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatHistoryActionsMenu;
