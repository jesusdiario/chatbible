
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeframedHistory } from '@/types/chat';

interface ChatHistoryListProps {
  chatHistory: TimeframedHistory[];
  onChatSelect?: (chatId: string) => void;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ chatHistory, onChatSelect }) => {
  const navigate = useNavigate();

  const handleChatClick = (slug: string) => {
    if (onChatSelect) {
      onChatSelect(slug);
    }
    navigate(`/chat/${slug}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-6 text-center text-white">Histórico de Conversas</h2>
      <div className="space-y-6">
        {chatHistory.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400 mb-2">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((chat) => (
                <button
                  key={chat.slug}
                  onClick={() => handleChatClick(chat.slug || '')}
                  className="w-full text-left p-3 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-3"
                >
                  <div className="h-6 w-6 rounded bg-zinc-700 flex items-center justify-center">
                    <span className="text-xs">AI</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{chat.title}</p>
                    {chat.last_message && (
                      <p className="text-xs text-gray-400 truncate">{chat.last_message}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistoryList;
