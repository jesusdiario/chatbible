
import React from 'react';
import { useChatState } from '@/hooks/useChatState';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';
import { loadChatMessages } from '@/services/persistenceService';
import { BibleBook } from '@/types/bible';
import BookChat from './BookChat';
import { useChatOperations } from '@/hooks/useChatOperations';

interface BookChatContainerProps {
  bookDetails: BibleBook;
  book?: string;
  slug?: string;
}

const BookChatContainer: React.FC<BookChatContainerProps> = ({ 
  bookDetails, 
  book,
  slug 
}) => {
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId
  } = useChatState({ book, slug });

  const {
    handleSendMessage,
    isTyping,
    messageProcessingRef,
    lastMessageRef
  } = useChatOperations(book, userId, slug, messages, setMessages, setIsLoading);

  useVisibilityChange(() => {
    if (slug && messageProcessingRef.current) {
      loadChatMessages(slug).then(updatedMessages => {
        if (updatedMessages) {
          setMessages(updatedMessages);
        }
      });
    }
  });

  return (
    <BookChat
      title={bookDetails.title}
      messages={messages}
      isLoading={isLoading}
      isTyping={isTyping}
      bookSlug={book}
      onSendMessage={handleSendMessage}
    />
  );
};

export default BookChatContainer;
