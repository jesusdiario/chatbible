
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeframedHistory } from '@/types/chat';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatHistoryListProps {
  chatHistory: TimeframedHistory[];
  onChatSelect?: (chatId: string) => void;
  currentPath?: string;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ 
  chatHistory, 
  onChatSelect,
  currentPath 
}) => {
  const navigate = useNavigate();

  const handleChatClick = (slug: string) => {
    if (onChatSelect) {
      onChatSelect(slug);
    }
    navigate(`/chat/${slug}`);
  };

  return (
    <div className="w-full space-y-4 px-2">
      {chatHistory.map((group) => (
        <div key={group.title} className="space-y-1">
          <h3 className="mb-2 px-2 text-xs font-semibold text-gray-500">
            {group.title}
          </h3>
          <div className="space-y-1">
            {group.items.map((chat) => (
              <TooltipProvider key={chat.slug}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleChatClick(chat.slug || '')}
                      className={cn(
                        "w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 hover:bg-gray-100",
                        currentPath?.includes(chat.slug || '') && "bg-gray-100"
                      )}
                    >
                      <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-700">AI</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {chat.title}
                        </p>
                        {chat.last_message && (
                          <p className="text-xs text-gray-500 truncate">
                            {chat.last_message}
                          </p>
                        )}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[300px]">
                    <p>{chat.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistoryList;
