
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Book, Lock } from "lucide-react";
import { ChatHistory } from "@/types/chat";
import { cn } from "@/lib/utils";
import ChatHistoryActionsMenu from "./ChatHistoryActionsMenu";

export interface ChatHistoryItemProps {
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
  // Format the date nicely
  const formattedDate = formatDistanceToNow(new Date(chat.lastAccessed), {
    addSuffix: true,
    locale: ptBR,
  });

  const handleClick = () => {
    if (chat.slug) {
      onSelect(chat.slug);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-colors",
        isAccessible 
          ? "hover:bg-gray-100 cursor-pointer" 
          : "opacity-70 cursor-default bg-gray-50",
        chat.pinned && "bg-blue-50 hover:bg-blue-100"
      )}
      onClick={isAccessible ? handleClick : undefined}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {chat.book_slug && (
            <Book className="h-4 w-4 text-blue-500" />
          )}
          <div className="flex-1 truncate font-medium">
            {chat.title || "Nova conversa"}
          </div>
          {!isAccessible && (
            <Lock className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
          <span>{formattedDate}</span>
          {chat.subscription_required && !isAccessible && (
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">
              Premium
            </span>
          )}
        </div>
      </div>
      
      <ChatHistoryActionsMenu 
        chat={chat}
        onDelete={() => onDelete(chat.id)}
        onHistoryUpdated={onHistoryUpdated}
        isAccessible={isAccessible}
      />
    </div>
  );
};

export default ChatHistoryItem;
