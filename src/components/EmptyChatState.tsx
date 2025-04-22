
import React from 'react';
import ChatInput from '@/components/ChatInput';
import ActionButtons, { ChatContext } from '@/components/ActionButtons';
import LeviticusActionButtons from '@/components/LeviticusActionButtons';
import ExodusActionButtons from '@/components/ExodusActionButtons';

interface EmptyChatStateProps {
  title: string;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  bookSlug?: string;
}

const EmptyChatState = ({ title, onSendMessage, isLoading, bookSlug }: EmptyChatStateProps) => {
  const getActionButtonsComponent = () => {
    switch (bookSlug) {
      case 'levitico':
        return LeviticusActionButtons;
      case 'exodo':
        return ExodusActionButtons;
      default:
        return ActionButtons;
    }
  };

  const ActionButtonsComponent = getActionButtonsComponent();

  return (
    <div className="w-full max-w-3xl px-4 space-y-4">
      <div>
        <h1 className="mb-8 text-3xl md:text-4xl font-semibold text-center">
          Converse sobre {title}
        </h1>
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
      <ChatContext.Provider value={{ sendMessage: onSendMessage }}>
        <ActionButtonsComponent />
      </ChatContext.Provider>
    </div>
  );
};

export default EmptyChatState;
