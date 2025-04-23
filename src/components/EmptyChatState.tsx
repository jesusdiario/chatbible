
import React from 'react';
import ChatInput from '@/components/ChatInput';
import ActionButtons, { ChatContext } from '@/components/ActionButtons';
import BookActionButtons from '@/components/BookActionButtons';

interface EmptyChatStateProps {
  title: string;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  bookSlug?: string;
}

const EmptyChatState = ({ title, onSendMessage, isLoading, bookSlug }: EmptyChatStateProps) => {
  // Use the BookActionButtons component if we have a bookSlug
  const ActionButtonsComponent = bookSlug ? BookActionButtons : ActionButtons;

  return (
    <div className="w-full max-w-3xl px-4 space-y-4">
      <div>
        <h1 className="mb-8 text-3xl md:text-4xl font-semibold text-center text-text-primary">
          Converse sobre {title}
        </h1>
        <ChatInput onSend={onSendMessage} isLoading={isLoading} bookSlug={bookSlug} />
      </div>
      <ChatContext.Provider value={{ sendMessage: onSendMessage }}>
        <ActionButtonsComponent bookSlug={bookSlug} />
      </ChatContext.Provider>
    </div>
  );
};

export default EmptyChatState;
