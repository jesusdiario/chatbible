
import React from 'react';
import { ChatHistory } from '@/types/chat';
import { ChatHistoryItem } from './ChatHistoryItem';
import ChatHistoryGroup from './ChatHistoryGroup';
import ChatHistoryEmptyState from './ChatHistoryEmptyState';

interface ChatHistoryTabContentProps {
  chatHistory: { title: string; items: ChatHistory[] }[];
  flatChats?: ChatHistory[];
  onChatSelect: (slug: string) => void;
  onDelete: (id: string) => void;
  onHistoryUpdated?: () => void;
  isSubscribed: boolean;
  searchQuery?: string;
  isEmpty: boolean;
}

const ChatHistoryTabContent: React.FC<ChatHistoryTabContentProps> = ({
  chatHistory,
  flatChats,
  onChatSelect,
  onDelete,
  onHistoryUpdated,
  isSubscribed,
  searchQuery,
  isEmpty
}) => {
  if (isEmpty) {
    return <ChatHistoryEmptyState searchQuery={searchQuery} />;
  }

  // If we're rendering a flat list (pinned or books)
  if (flatChats) {
    return (
      <div className="space-y-1">
        {flatChats.map((chat) => (
          <ChatHistoryItem
            key={chat.id}
            chat={chat}
            onSelect={onChatSelect}
            onDelete={onDelete}
            onHistoryUpdated={onHistoryUpdated}
            isAccessible={isSubscribed || !chat.subscription_required}
          />
        ))}
      </div>
    );
  }

  // Render grouped chats
  return (
    <div className="space-y-6">
      {chatHistory.map((group) => (
        <ChatHistoryGroup
          key={group.title}
          title={group.title}
          items={group.items}
          onChatSelect={onChatSelect}
          onDelete={onDelete}
          onHistoryUpdated={onHistoryUpdated}
          isSubscribed={isSubscribed}
        />
      ))}
    </div>
  );
};

export default ChatHistoryTabContent;
