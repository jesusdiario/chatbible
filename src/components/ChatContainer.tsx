
import React from 'react';
import ChatLayout from '@/components/ChatLayout';
import { Message } from '@/types/messages';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const ChatContainer = ({ messages, onSendMessage, isLoading }: ChatContainerProps) => {
  return (
    <ChatLayout
      messages={messages}
      onSendMessage={onSendMessage}
      isLoading={isLoading}
      disclaimerText="O assistente Esboço de Pregação pode cometer erros. Verifique informações importantes."
      inputPlaceholder="Descreva o tema ou assunto do sermão"
    />
  );
};

export default ChatContainer;
