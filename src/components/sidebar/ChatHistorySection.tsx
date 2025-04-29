
import React from "react";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatHistory } from "@/types/chat";
import { useNavigate } from "react-router-dom";

interface ChatHistorySectionProps {
  chatHistory?: ChatHistory[];
  currentPath?: string;
  onChatSelect?: (chatId: string) => void;
  onToggle?: () => void;
  subscribed: boolean;
}

const ChatHistorySection: React.FC<ChatHistorySectionProps> = ({ 
  chatHistory = [], 
  currentPath, 
  onChatSelect, 
  onToggle,
  subscribed
}) => {
  const navigate = useNavigate();
  const hasChatHistory = chatHistory && chatHistory.length > 0;

  return (
    <div className="mb-6">
      <span className="text-sm text-gray-500 mb-2 block">Histórico</span>
      
      {!hasChatHistory && (
        <div className="px-3 py-4 text-sm text-gray-500 text-center">
          {subscribed 
            ? "Você não tem conversas salvas ainda."
            : "Histórico de chat disponível apenas para usuários PRO."}
        </div>
      )}
      
      {hasChatHistory && chatHistory.map((chat) => (
        <div key={chat.id} className="mb-1">
          <button 
            onClick={() => {
              if (onChatSelect) {
                onChatSelect(chat.id);
              }
              if (window.innerWidth < 768) {
                onToggle?.();
              }
            }} 
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg truncate", 
              currentPath === `/chat/${chat.slug}` ? "bg-gray-100" : "hover:bg-gray-50"
            )}
          >
            <History className="h-5 w-5 text-gray-500" />
            <span className="truncate">{chat.title}</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ChatHistorySection;
