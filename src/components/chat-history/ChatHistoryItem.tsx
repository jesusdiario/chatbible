
import React from 'react';
import { ChatHistory } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { Pin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import ChatHistoryActions from './ChatHistoryActions';
import { toggleChatPin } from '@/services/persistenceService';

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

  // Format date: "23 de abril 10:30"
  const formattedDate = format(
    new Date(chat.lastAccessed),
    "d 'de' MMMM HH:mm",
    { locale: ptBR }
  );

  return (
    <div className="relative border-b border-gray-100 last:border-none">
      <div className="p-4 space-y-2">
        {/* Date */}
        <div className="text-sm text-gray-500 font-medium mb-1">
          {formattedDate}
        </div>
        
        {/* Book name if present - Now in black */}
        {chat.book_slug && (
          <div className="text-lg font-bold text-black">
            {chat.book_slug.charAt(0).toUpperCase() + chat.book_slug.slice(1)}
          </div>
        )}
        
        {/* Chat title - Only make this element clickable and now in blue */}
        <div 
          className={`text-base font-medium py-1 cursor-pointer ${isAccessible ? 'text-chatgpt-accent hover:text-chatgpt-accent/80' : 'opacity-70'}`}
          onClick={handleSelect}
        >
          "{chat.title}"
          {chat.pinned && (
            <Pin className="inline-block h-3 w-3 text-chatgpt-accent ml-1" />
          )}
        </div>
        
        {/* Last message preview */}
        {chat.last_message && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {chat.last_message}
          </p>
        )}
        
        {/* Action buttons component */}
        <ChatHistoryActions 
          chat={chat}
          isAccessible={isAccessible}
          onDelete={onDelete}
          onTogglePin={handleTogglePin}
          isPerformingAction={isPerformingAction}
          setIsPerformingAction={setIsPerformingAction}
          onHistoryUpdated={onHistoryUpdated}
        />
      </div>
    </div>
  );
};

export default ChatHistoryItem;
