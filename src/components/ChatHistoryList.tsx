
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHistory } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatHistoryListProps {
  chatHistory: ChatHistory[];
  onChatSelect?: (chatId: string) => void;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ chatHistory, onChatSelect }) => {
  const navigate = useNavigate();

  if (chatHistory.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        Nenhuma conversa anterior.
      </div>
    );
  }

  const handleChatClick = (chatId: string, slug: string, bookSlug?: string) => {
    if (bookSlug) {
      navigate(`/livros-da-biblia/${bookSlug}/${slug}`);
    } else {
      navigate(`/chat/${slug}`);
    }
    
    if (onChatSelect) {
      onChatSelect(chatId);
    }
  };

  const formatRelativeTime = (date: Date) => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ptBR,
    });
  };

  return (
    <ul className="space-y-2">
      {chatHistory.map((chat) => (
        <li key={chat.id} className="animate-fadeIn">
          <button
            className="w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-800 flex justify-between items-center"
            onClick={() => handleChatClick(chat.id, chat.slug || '', chat.book_slug)}
          >
            <div className="truncate flex-1">
              <span className="block font-medium">{chat.title}</span>
            </div>
            <time className="text-xs text-gray-400 ml-2 whitespace-nowrap">
              {formatRelativeTime(chat.lastAccessed)}
            </time>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default ChatHistoryList;
