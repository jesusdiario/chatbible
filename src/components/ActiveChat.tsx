
import React from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ActiveChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const ActiveChat = ({ messages, onSendMessage, isLoading }: ActiveChatProps) => {
  return (
    <>
      <MessageList messages={messages} />
      <div className="w-full max-w-3xl mx-auto px-4 py-2">
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
      <div className="text-xs text-center text-gray-500 py-2">
        O BibleGPT pode cometer erros. Verifique informações importantes.
      </div>
    </>
  );
};

export default ActiveChat;
