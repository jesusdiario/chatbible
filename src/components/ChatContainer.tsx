
import React from 'react';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';

interface ChatContainerProps {
  messages: { role: 'user' | 'assistant'; content: string }[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const ChatContainer = ({ messages, onSendMessage, isLoading }: ChatContainerProps) => {
  return (
    <>
      <MessageList messages={messages} />
      <div className="w-full max-w-3xl mx-auto px-4 py-2">
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
      <div className="text-xs text-center text-gray-500 py-2">
        O assistente Esboço de Pregação pode cometer erros. Verifique informações importantes.
      </div>
    </>
  );
};

export default ChatContainer;
