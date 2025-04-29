
import React, { useCallback, useEffect } from 'react';
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

  // Função para recarregar as mensagens quando necessário
  const reloadMessages = useCallback(async () => {
    if (!slug) return;
    
    try {
      console.log("Recarregando mensagens do chat...");
      const updatedMessages = await loadChatMessages(slug);
      if (updatedMessages && updatedMessages.length > 0) {
        console.log("Mensagens recarregadas com sucesso:", updatedMessages.length);
        setMessages(updatedMessages);
      }
    } catch (error) {
      console.error("Erro ao recarregar mensagens:", error);
    }
  }, [slug, setMessages]);

  // Efeito para recarregar mensagens inicialmente
  useEffect(() => {
    if (slug) {
      reloadMessages();
    }
  }, [slug, reloadMessages]);

  // Função de recarga otimizada para quando a página volta ao foco
  const handleVisibilityChange = useCallback(() => {
    if (slug) {
      console.log("Visibilidade alterada, verificando estado do chat");
      reloadMessages();
    }
  }, [slug, reloadMessages]);

  // Usa o hook de visibilidade aprimorado
  useVisibilityChange(handleVisibilityChange);

  return (
    <div className="flex flex-col h-full">
      <BookChat
        title={bookDetails.title}
        messages={messages}
        isLoading={isLoading}
        isTyping={isTyping}
        bookSlug={book}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default BookChatContainer;
