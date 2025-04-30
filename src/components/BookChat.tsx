
import React from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import EmptyChatState from './EmptyChatState';
import { Message } from '@/types/chat';

interface BookChatProps {
  title: string;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  bookSlug?: string;
  onSendMessage: (content: string) => void;
  loadingStage?: string | null;
}

const BookChat: React.FC<BookChatProps> = ({
  title,
  messages,
  isLoading,
  isTyping,
  bookSlug,
  onSendMessage,
  loadingStage
}) => {
  return (
    <div className={`flex h-full flex-col ${messages.length === 0 ? 'items-center justify-center' : 'justify-between'} pt-[60px] pb-4`}>
      {messages.length === 0 ? (
        <EmptyChatState
          title={title}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          bookSlug={bookSlug}
        />
      ) : (
        <>
          <MessageList 
            messages={messages} 
            isTyping={isTyping} 
            loadingStage={loadingStage}
            disableAutoScroll={true} // Desativa o scroll automático
          />
          <div className="w-full max-w-3xl mx-auto px-4 py-2">
            <ChatInput 
              onSend={onSendMessage} 
              isLoading={isLoading}
              bookSlug={bookSlug}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BookChat;
