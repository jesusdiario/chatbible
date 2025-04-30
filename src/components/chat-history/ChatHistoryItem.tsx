
import React from "react";
import { ChatHistory } from "@/types/chat";
import { MessageSquare, Lock, Star } from "lucide-react";
import { format } from "date-fns";
import ChatHistoryActionsMenu from "./ChatHistoryActionsMenu";
import { cn } from "@/lib/utils";

export interface ChatHistoryItemProps {
  chat: ChatHistory;
  onSelect: (slug: string) => void;
  onDelete: (chatId: string) => void;
  onHistoryUpdated: () => void;
  isAccessible?: boolean;
}

export const ChatHistoryItem = ({ 
  chat, 
  onSelect, 
  onDelete,
  onHistoryUpdated,
  isAccessible = true
}: ChatHistoryItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b cursor-pointer",
        isAccessible ? "hover:bg-gray-100" : "opacity-50 cursor-not-allowed"
      )}
      onClick={() => isAccessible && onSelect(chat.slug)}
    >
      <div className="flex items-center">
        {chat.is_accessible ? (
          <MessageSquare className="h-6 w-6 text-blue-500" />
        ) : (
          <Lock className="h-6 w-6 text-gray-400" />
        )}
        <div className="ml-3">
          <h3 className="text-lg font-semibold">{chat.title}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(chat.lastAccessed), "dd/MM/yyyy HH:mm")}
          </p>
        </div>
      </div>
      <ChatHistoryActionsMenu 
        chatId={chat.id} 
        onDelete={onDelete} 
        onHistoryUpdated={onHistoryUpdated} 
      />
    </div>
  );
};

