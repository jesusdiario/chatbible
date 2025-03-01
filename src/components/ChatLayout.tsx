
import React from 'react';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import { Message } from '@/types/messages';

interface ChatLayoutProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  disclaimerText: string;
  inputPlaceholder?: string;
}

/**
 * A reusable layout component for chat interfaces
 */
const ChatLayout = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  disclaimerText,
  inputPlaceholder 
}: ChatLayoutProps) => {
  return (
    <>
      <MessageList messages={messages} />
      <div className="w-full max-w-3xl mx-auto px-4 py-2">
        <ChatInput 
          onSend={onSendMessage} 
          isLoading={isLoading} 
          placeholder={inputPlaceholder}
        />
      </div>
      <div className="text-xs text-center text-gray-500 py-2">
        {disclaimerText}
      </div>
    </>
  );
};

export default ChatLayout;
