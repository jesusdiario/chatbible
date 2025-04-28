
import { FC, useRef, useEffect } from 'react';
import Message from './Message';
import { Message as MessageType } from '@/types/chat';

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

const MessageList: FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4 pb-165">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
        {isTyping && (
          <div className="py-6">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-[#F7F7F8] flex items-center justify-center">
                <span className="text-sm">BC</span>
              </div>
              <div className="flex-1">
                <div className="prose prose-invert max-w-none">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
