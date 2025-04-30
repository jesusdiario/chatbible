
import React, { useState } from 'react';
import { MessageCircle, Pin, Calendar, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChatHistory } from '@/types/chat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { deleteChat, toggleChatPin, updateChatTitle } from '@/services/persistenceService';
import ChatHistoryActionsMenu from './ChatHistoryActionsMenu';
import DeleteDialog from './DeleteDialog';
import RenameDialog from './RenameDialog';
import { useSubscription } from '@/hooks/useSubscription';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatHistoryItemProps {
  chat: ChatHistory;
  onSelect?: (slug: string) => void;
  onDelete?: (chatId: string) => void;
  onHistoryUpdated?: () => void;
}

const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({
  chat,
  onSelect,
  onDelete,
  onHistoryUpdated,
}) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const { subscribed } = useSubscription();
  
  // Check if chat is accessible
  const isAccessible = !chat.subscription_required || subscribed;
  
  // Format date for display
  const formattedDate = format(new Date(chat.lastAccessed), 'PP', { locale: ptBR });
  
  const handleClick = () => {
    // Navigate to the chat page with the slug
    if (onSelect) {
      onSelect(chat.slug || '');
    } else {
      navigate(`/chat/${chat.slug}`);
    }
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteChat(chat.id);
      
      if (success) {
        if (onDelete) {
          onDelete(chat.id);
        }
        
        if (onHistoryUpdated) {
          onHistoryUpdated();
        }
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleTogglePin = async () => {
    try {
      setIsUpdating(true);
      const success = await toggleChatPin(chat.slug || '', !chat.pinned);
      
      if (success && onHistoryUpdated) {
        onHistoryUpdated();
      }
    } catch (err) {
      console.error('Error toggling pin status:', err);
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
      const success = await updateChatTitle(chat.slug || '', newTitle);
      
      if (success && onHistoryUpdated) {
        onHistoryUpdated();
      }
    } catch (err) {
      console.error('Error renaming chat:', err);
    } finally {
      setIsUpdating(false);
      setIsRenameDialogOpen(false);
    }
  };
  
  return (
    <>
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer relative group",
          !isAccessible && "opacity-70"
        )}
        onClick={handleClick}
      >
        <div className={cn(
          "h-10 w-10 rounded-full border flex items-center justify-center flex-shrink-0",
          chat.book_slug ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200",
          !isAccessible && "border-amber-200 bg-amber-50"
        )}>
          <MessageCircle className={cn(
            "h-5 w-5",
            chat.book_slug ? "text-blue-500" : "text-gray-500",
            !isAccessible && "text-amber-500"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">
              {chat.title}
            </h3>
            {chat.pinned && <Pin className="h-3 w-3 text-blue-500 flex-shrink-0" />}
            
            {!isAccessible && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex-shrink-0">
                      <Lock className="h-3 w-3 text-amber-500" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Conteúdo premium - Faça upgrade para acessar o histórico completo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
            {!isAccessible && <span className="text-amber-500 ml-1">(Premium)</span>}
          </div>
        </div>
        
        <div 
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChatHistoryActionsMenu
            isPinned={chat.pinned || false}
            isUpdating={isUpdating}
            onRename={() => {
              setNewTitle(chat.title);
              setIsRenameDialogOpen(true);
            }}
            onTogglePin={handleTogglePin}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
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
