import React from "react";
import { History, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatHistory } from "@/types/chat";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  
  // Get pinned chats
  const pinnedChats = chatHistory.filter(chat => chat.pinned);
  // Get recent chats (non-pinned), limit to 5
  const recentChats = chatHistory.filter(chat => !chat.pinned).slice(0, 5);

  const handleChatClick = (chat: ChatHistory) => {
    if (onChatSelect) {
      onChatSelect(chat.id);
    } else {
      // Updated to use the proper chat URL format
      navigate(`/chat/${chat.slug}`);
    }
    
    if (window.innerWidth < 768) {
      onToggle?.();
    }
  };

  const handleViewAllHistory = () => {
    navigate('/history');
    if (window.innerWidth < 768) {
      onToggle?.();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Histórico</span>
        {hasChatHistory && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-gray-500 hover:text-gray-700"
            onClick={handleViewAllHistory}
          >
            Ver tudo
          </Button>
        )}
      </div>
      
      {!hasChatHistory && (
        <div className="px-3 py-4 text-sm text-gray-500 text-center">
          {subscribed 
            ? "Você não tem conversas salvas ainda."
            : "Histórico de chat disponível apenas para usuários PRO."}
        </div>
      )}
      
      {pinnedChats.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center px-3 mb-1">
            <Pin className="h-3 w-3 text-gray-500 mr-1" />
            <span className="text-xs text-gray-500">Fixados</span>
          </div>
          {pinnedChats.map((chat) => (
            <div key={chat.id} className="mb-1">
              <button 
                onClick={() => handleChatClick(chat)} 
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg truncate", 
                  currentPath === `/chat/${chat.slug}` ? "bg-gray-100" : "hover:bg-gray-50"
                )}
              >
                <History className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {recentChats.length > 0 && (
        <div>
          {pinnedChats.length > 0 && (
            <div className="flex items-center px-3 mb-1">
              <span className="text-xs text-gray-500">Recentes</span>
            </div>
          )}
          {recentChats.map((chat) => (
            <div key={chat.id} className="mb-1">
              <button 
                onClick={() => handleChatClick(chat)} 
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg truncate", 
                  currentPath === `/chat/${chat.slug}` ? "bg-gray-100" : "hover:bg-gray-50"
                )}
              >
                <History className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistorySection;
