
import React from 'react';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';
import { Message } from '@/types/messages';

interface MainChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const MainChat = ({ messages, onSendMessage, isLoading }: MainChatProps) => {
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

export default MainChat;
