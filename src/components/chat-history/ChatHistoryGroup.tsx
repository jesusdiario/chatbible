
import React from 'react';
import { ChatHistory } from '@/types/chat';
import { ChatHistoryItem } from './ChatHistoryItem';

interface ChatHistoryGroupProps {
  title: string;
  items: ChatHistory[];
  onChatSelect: (slug: string) => void;
  onDelete: (id: string) => void;
  onHistoryUpdated?: () => void;
  isSubscribed: boolean;
}

const ChatHistoryGroup: React.FC<ChatHistoryGroupProps> = ({
  title,
  items,
  onChatSelect,
  onDelete,
  onHistoryUpdated,
  isSubscribed
}) => {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2 mb-8">
      <h3 className="text-sm font-medium text-chatgpt-accent mb-3 px-3">{title}</h3>
      <div className="space-y-2 divide-y divide-gray-100">
        {items.map((chat) => (
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
    </div>
  );
};

export default ChatHistoryGroup;
