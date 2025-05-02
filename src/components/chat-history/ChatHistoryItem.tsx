
import React from 'react';
import { ChatHistory } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Pencil, Pin, Trash2 } from 'lucide-react';
import { toggleChatPin, updateChatTitle, deleteChat } from '@/services/persistenceService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

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
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(chat.title);
  const [isPerformingAction, setIsPerformingAction] = React.useState(false);

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

  const handleTogglePin = async () => {
    if (isPerformingAction) return;
    
    try {
      setIsPerformingAction(true);
      const success = await toggleChatPin(chat.slug || '', !chat.pinned);
      
      if (success) {
        toast({
          title: chat.pinned ? "Conversa desafixada" : "Conversa fixada",
          description: chat.pinned 
            ? "A conversa foi removida dos fixados." 
            : "A conversa foi adicionada aos fixados.",
        });
        
        if (onHistoryUpdated) {
          onHistoryUpdated();
        }
      } else {
        throw new Error("Falha ao fixar/desafixar conversa");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da conversa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsPerformingAction(false);
    }
  };

  const handleDelete = async () => {
    if (isPerformingAction) return;

    if (!window.confirm("Tem certeza que deseja excluir esta conversa?")) {
      return;
    }
    
    try {
      setIsPerformingAction(true);
      const success = await deleteChat(chat.id);
      
      if (success) {
        toast({
          title: "Conversa excluída",
          description: "A conversa foi removida do seu histórico.",
        });
        
        onDelete(chat.id);
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

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPerformingAction) return;
    
    try {
      setIsPerformingAction(true);
      
      if (!newTitle.trim() || newTitle === chat.title) {
        setIsRenaming(false);
        setNewTitle(chat.title);
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

  // Format date: "23 de abril 10:30"
  const formattedDate = format(
    new Date(chat.lastAccessed),
    "d 'de' MMMM HH:mm",
    { locale: ptBR }
  );

  return (
    <div 
      className={`
        relative border-b border-gray-100 last:border-none
        ${isAccessible ? 'hover:bg-chatgpt-hover cursor-pointer' : 'opacity-70'}
      `}
      onClick={isRenaming ? undefined : handleSelect}
    >
      <div className="p-4 space-y-1">
        {/* Book name at the top if present */}
        {chat.book_slug && (
          <div className="text-lg font-bold text-chatgpt-accent">
            {chat.book_slug.charAt(0).toUpperCase() + chat.book_slug.slice(1)}
          </div>
        )}
        
        {/* Date */}
        <div className="text-sm text-gray-500 font-medium">
          {formattedDate}
        </div>
        
        {/* Chat title */}
        {isRenaming ? (
          <form onSubmit={handleSaveRename} className="py-1">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-chatgpt-border rounded p-1 text-base"
              autoFocus
              onBlur={() => {
                setIsRenaming(false);
                setNewTitle(chat.title);
              }}
            />
          </form>
        ) : (
          <div className="text-base font-medium">
            "{chat.title}"
            {chat.pinned && (
              <Pin className="inline-block h-3 w-3 text-chatgpt-accent ml-1" />
            )}
          </div>
        )}
        
        {/* Last message preview */}
        {chat.last_message && !isRenaming && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {chat.last_message}
          </p>
        )}
        
        {/* Action buttons at bottom */}
        {!isRenaming && (
          <div className="flex gap-4 mt-3 text-gray-500">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 h-auto hover:bg-transparent hover:text-gray-700 font-normal"
              onClick={(e) => {
                e.stopPropagation();
                handleStartRename(e);
              }}
              disabled={isPerformingAction || !isAccessible}
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
                handleTogglePin();
              }}
              disabled={isPerformingAction || !isAccessible}
            >
              <Pin className="h-4 w-4 mr-1" />
              {chat.pinned ? 'Desafixar' : 'Fixar'}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="p-0 h-auto hover:bg-transparent hover:text-red-500 font-normal"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isPerformingAction || !isAccessible}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        )}
        
        {/* Upgrade button for inaccessible chats */}
        {!isAccessible && (
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
        )}
      </div>
    </div>
  );
};

export default ChatHistoryItem;
