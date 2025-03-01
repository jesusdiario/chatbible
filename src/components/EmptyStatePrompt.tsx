
import React, { useContext } from 'react';
import ChatInput from '@/components/ChatInput';
import ActionButtons, { ChatContext } from '@/components/ActionButtons';

interface EmptyStatePromptProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const EmptyStatePrompt = ({ onSendMessage, isLoading }: EmptyStatePromptProps) => {
  return (
    <div className="w-full max-w-3xl px-4 space-y-4">
      <div>
        <h1 className="mb-8 text-4xl font-semibold text-center">Como podemos ajudar?</h1>
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
      <ChatContext.Provider value={{
        sendMessage: onSendMessage
      }}>
        <ActionButtons />
      </ChatContext.Provider>
    </div>
  );
};

export default EmptyStatePrompt;
