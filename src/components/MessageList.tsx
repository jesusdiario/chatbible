
import { FC } from 'react';
import Message from './Message';
import { Message as MessageType } from '@/types/chat';

interface MessageListProps {
  messages: MessageType[];
}

const MessageList: FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4 pb-165">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
      </div>
    </div>
  );
};

export default MessageList;
