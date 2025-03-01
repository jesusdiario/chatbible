
import React from 'react';
import Message from './Message';
import { Message as MessageType } from '@/types/messages';

const MessageList = ({ messages }: { messages: MessageType[] }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
      </div>
    </div>
  );
};

export default MessageList;
