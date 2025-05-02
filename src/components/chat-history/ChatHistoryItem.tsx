
import React from 'react';
import {
  ChevronRight,
  Pin,
  BookText
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

  // Format date to display in a more human-readable format
  const formattedDate = new Date(chat.lastAccessed).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
        isAccessible 
          ? 'hover:bg-chatgpt-hover border border-transparent hover:border-chatgpt-border cursor-pointer' 
          : 'opacity-70'
      }`}
    >
      <div className="flex-shrink-0">
        {chat.book_slug ? (
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-chatgpt-accent">
            <BookText size={18} />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
            <span className="text-sm font-medium">
              {chat.title.substring(0, 1).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      <div 
        className="flex-1 min-w-0"
        onClick={handleSelect}
      >
        <div className="flex items-center">
          <div className="flex items-center gap-1 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">
              {chat.title}
              {chat.pinned && (
                <Pin className="inline-block h-3 w-3 text-chatgpt-accent ml-1" />
              )}
            </p>
          </div>
          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
            {formattedDate}
          </span>
        </div>
        
        {chat.last_message && (
          <p className="text-xs text-gray-500 truncate mt-1">
            {chat.last_message.length > 60 
              ? `"${chat.last_message.substring(0, 60)}..."` 
              : `"${chat.last_message}"`}
          </p>
        )}
      </div>
      
      <div className="flex items-center">
        {!isAccessible && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 text-xs px-2 py-1 h-auto text-chatgpt-accent hover:text-chatgpt-accent/80"
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
          <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
        )}
      </div>
    </div>
  );
};

export default ChatHistoryItem;
