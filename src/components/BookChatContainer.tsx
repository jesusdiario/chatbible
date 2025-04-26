
import React, { useCallback } from 'react';
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

  // Função de recarga otimizada para quando a página volta ao foco
  const handleVisibilityChange = useCallback(() => {
    if (slug && messageProcessingRef.current) {
      console.log("Reloading messages after visibility change");
      loadChatMessages(slug).then(updatedMessages => {
        if (updatedMessages) {
          setMessages(updatedMessages);
          // Marca que não está mais processando uma vez que carregamos as mensagens atualizadas
          messageProcessingRef.current = false;
        }
      });
    }
  }, [slug, messageProcessingRef, setMessages]);

  // Usa o hook de visibilidade aprimorado
  useVisibilityChange(handleVisibilityChange);

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
