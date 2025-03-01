
import React from 'react';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import EmptyStatePrompt from '@/components/EmptyStatePrompt';
import { Message } from '@/types/message';

interface ChatContentProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatContent = ({ messages, onSendMessage, isLoading }: ChatContentProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center pt-[60px] pb-4">
        <EmptyStatePrompt onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between pt-[60px] pb-4">
      <MessageList messages={messages} />
      <div className="w-full max-w-3xl mx-auto px-4 py-2">
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
      <div className="text-xs text-center text-gray-500 py-2">
        O BibleGPT pode cometer erros. Verifique informações importantes.
      </div>
    </div>
  );
};

export default ChatContent;
