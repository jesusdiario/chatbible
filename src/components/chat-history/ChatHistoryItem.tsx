
import React from 'react';
import {
  ChevronRight,
  Pin,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChatHistory } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ChatHistoryActionsMenu from './ChatHistoryActionsMenu';

export interface ChatHistoryItemProps {
  chat: ChatHistory;
  onSelect: (slug: string) => void;
  onDelete: (id: string) => void;
  onHistoryUpdated?: () => void;
  isAccessible?: boolean;
}

export const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({ 
  chat, 
  onSelect, 
  onDelete,
  onHistoryUpdated,
  isAccessible = true 
}) => {
  const { toast } = useToast();

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

  return (
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
          chatId={chat.id}
          slug={chat.slug || ''}
          title={chat.title}
          isPinned={chat.pinned || false}
          onDelete={onDelete}
          onHistoryUpdated={onHistoryUpdated || (() => {})}
        />
        
        {isAccessible && (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </div>
    </div>
  );
};

export default ChatHistoryItem;
