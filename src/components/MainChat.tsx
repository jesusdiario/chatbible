
import React from 'react';
import ChatLayout from '@/components/ChatLayout';
import { Message } from '@/types/messages';

interface MainChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const MainChat = ({ messages, onSendMessage, isLoading }: MainChatProps) => {
  return (
    <ChatLayout
      messages={messages}
      onSendMessage={onSendMessage}
      isLoading={isLoading}
      disclaimerText="O BibleGPT pode cometer erros. Verifique informações importantes."
      inputPlaceholder="Sua dúvida bíblica"
    />
  );
};

export default MainChat;
