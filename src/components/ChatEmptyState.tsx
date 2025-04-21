
import React from 'react';
import ChatInput from './ChatInput';
import { useContext } from './ActionButtons';
import ActionButtons from './ActionButtons';

interface ChatEmptyStateProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const ChatEmptyState = ({ onSendMessage, isLoading }: ChatEmptyStateProps) => {
  return (
    <div className="w-full max-w-3xl px-4 space-y-4">
      <div>
        <h1 className="mb-8 text-4xl font-semibold text-center">
          Gênesis - Como podemos ajudar?
        </h1>
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
      <useContext.Provider value={{ sendMessage: onSendMessage }}>
        <ActionButtons />
      </useContext.Provider>
    </div>
  );
};

export default ChatEmptyState;
