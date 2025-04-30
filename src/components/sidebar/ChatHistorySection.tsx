
import React from "react";
import { History, Pin, Lock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { ChatHistory } from "@/types/chat";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

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
  const { startCheckout } = useSubscription();
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

  const handleUpgradeClick = () => {
    // Use o seu ID de preço real da Stripe aqui
    startCheckout('price_1PhpOSLyyMwTutR9t2Ws2udT');
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
        <div className="px-3 py-4 text-sm text-gray-500">
          {subscribed 
            ? "Você não tem conversas salvas ainda."
            : (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4 text-amber-500" />
                  <span>Histórico limitado no plano gratuito</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleUpgradeClick}
                >
                  Fazer upgrade
                </Button>
              </div>
            )
          }
        </div>
      )}
      
      {pinnedChats.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center px-3 mb-1">
            <Pin className="h-3 w-3 text-gray-500 mr-1" />
            <span className="text-xs text-gray-500">Fixados</span>
          </div>
          {pinnedChats.map((chat) => {
            const isAccessible = !chat.subscription_required || subscribed;
            
            return (
              <div key={chat.id} className="mb-1">
                <button 
                  onClick={() => handleChatClick(chat)} 
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg truncate", 
                    currentPath === `/chat/${chat.slug}` ? "bg-gray-100" : "hover:bg-gray-50",
                    !isAccessible && "text-amber-700"
                  )}
                >
                  <History className={cn("h-4 w-4 text-gray-500 flex-shrink-0", !isAccessible && "text-amber-500")} />
                  <span className="truncate">{chat.title}</span>
                  {!isAccessible && <Lock className="h-3 w-3 text-amber-500 ml-auto flex-shrink-0" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {recentChats.length > 0 && (
        <div>
          {pinnedChats.length > 0 && (
            <div className="flex items-center px-3 mb-1">
              <span className="text-xs text-gray-500">Recentes</span>
            </div>
          )}
          {recentChats.map((chat) => {
            const isAccessible = !chat.subscription_required || subscribed;
            
            return (
              <div key={chat.id} className="mb-1">
                <button 
                  onClick={() => handleChatClick(chat)} 
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg truncate", 
                    currentPath === `/chat/${chat.slug}` ? "bg-gray-100" : "hover:bg-gray-50",
                    !isAccessible && "text-amber-700"
                  )}
                >
                  <History className={cn("h-4 w-4 text-gray-500 flex-shrink-0", !isAccessible && "text-amber-500")} />
                  <span className="truncate">{chat.title}</span>
                  {!isAccessible && <Lock className="h-3 w-3 text-amber-500 ml-auto flex-shrink-0" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {hasChatHistory && !subscribed && (
        <div className="mt-2 px-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs flex items-center gap-1 border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800"
            onClick={handleUpgradeClick}
          >
            <Lock className="h-3 w-3" />
            Libere o histórico completo
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatHistorySection;
