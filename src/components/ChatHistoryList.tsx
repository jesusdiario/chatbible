
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimeframedHistory } from '@/types/chat';
import { useSubscription } from '@/hooks/useSubscription';
import ChatHistoryLoading from './chat-history/ChatHistoryLoading';
import ChatHistoryTabs from './chat-history/ChatHistoryTabs';
import ChatHistoryEmptyState from './chat-history/ChatHistoryEmptyState';

interface ChatHistoryListProps {
  chatHistory: TimeframedHistory[];
  onChatSelect?: (chatId: string) => void;
  isLoading?: boolean;
  onHistoryUpdated?: () => void;
  searchQuery?: string;
}

const ChatHistoryList: React.FC<ChatHistoryListProps> = ({ 
  chatHistory, 
  onChatSelect, 
  isLoading = false,
  onHistoryUpdated,
  searchQuery
}) => {
  const navigate = useNavigate();
  const [localHistory, setLocalHistory] = useState(chatHistory);
  const { subscribed } = useSubscription();
  
  useEffect(() => {
    setLocalHistory(chatHistory);
  }, [chatHistory]);

  const handleChatClick = (slug: string) => {
    if (onChatSelect) {
      onChatSelect(slug);
    }
    navigate(`/chat/${slug}`);
  };
  
  const handleDeleteChat = (chatId: string) => {
    // Atualizar o estado local para remover o chat excluído
    const updatedHistory = localHistory.map(group => ({
      ...group,
      items: group.items.filter(chat => chat.id !== chatId)
    })).filter(group => group.items.length > 0);
    
    setLocalHistory(updatedHistory);
    
    // Notificar o componente pai para atualizar o histórico global
    if (onHistoryUpdated) {
      onHistoryUpdated();
    }
  };
  
  if (isLoading) {
    return <ChatHistoryLoading />;
  }

  const isEmptyHistory = localHistory.length === 0 || localHistory.every(group => group.items.length === 0);

  if (isEmptyHistory) {
    return <ChatHistoryEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 bg-white rounded-lg shadow-sm">
      <ChatHistoryTabs
        chatHistory={localHistory}
        onChatSelect={handleChatClick}
        onDelete={handleDeleteChat}
        onHistoryUpdated={onHistoryUpdated}
        isSubscribed={subscribed}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default ChatHistoryList;
