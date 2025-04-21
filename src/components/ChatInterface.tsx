
import React from 'react';
import ChatEmptyState from './ChatEmptyState';
import ActiveChat from './ActiveChat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
}

const ChatInterface = ({ messages, isLoading, onSendMessage }: ChatInterfaceProps) => {
  return (
    <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
      {messages.length === 0 ? (
        <ChatEmptyState onSendMessage={onSendMessage} isLoading={isLoading} />
      ) : (
        <ActiveChat 
          messages={messages} 
          onSendMessage={onSendMessage} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
};

export default ChatInterface;
