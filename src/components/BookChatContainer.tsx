import React, { useCallback, useEffect, useRef } from 'react';
import { useChatState } from '@/hooks/useChatState';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';
import { loadChatMessages } from '@/services/persistenceService';
import { BibleBook } from '@/types/bible';
import BookChat from './BookChat';
import { useChatOperations } from '@/hooks/useChatOperations';
import { useLocation } from 'react-router-dom';

interface BookChatContainerProps {
  bookDetails: BookDetails;
  book?: string;
  slug?: string;
  initialPrompt?: string;
  systemPrompt?: string;
}

const BookChatContainer: React.FC<BookChatContainerProps> = ({ 
  bookDetails, 
  book,
  slug,
  initialPrompt,
  systemPrompt
}) => {
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt;
  
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
    lastMessageRef,
    loadingStage
  } = useChatOperations(book, userId, slug, messages, setMessages, setIsLoading);

  // Ref para evitar recargas durante o processamento de mensagens
  const preventReloadRef = useRef(false);
  
  // Ref para controlar se o prompt inicial já foi enviado
  const initialPromptSentRef = useRef(false);

  // Função para recarregar as mensagens quando necessário
  const reloadMessages = useCallback(async () => {
    if (!slug || preventReloadRef.current || isTyping || messageProcessingRef.current) {
      return;
    }
    
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
  }, [slug, setMessages, isTyping, messageProcessingRef]);

  // Efeito para recarregar mensagens inicialmente
  useEffect(() => {
    if (slug && !isTyping && !messageProcessingRef.current) {
      reloadMessages();
    }
  }, [slug, reloadMessages, isTyping, messageProcessingRef]);

  // Função de recarga otimizada para quando a página volta ao foco
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible' && slug && !isTyping && !messageProcessingRef.current) {
      console.log("Visibilidade alterada para visível, verificando estado do chat");
      reloadMessages();
    }
  }, [slug, reloadMessages, isTyping, messageProcessingRef]);

  // Usa o hook de visibilidade aprimorado
  useVisibilityChange(handleVisibilityChange);

  // Atualiza o estado do preventReloadRef quando o processamento de mensagens muda
  useEffect(() => {
    preventReloadRef.current = isTyping || messageProcessingRef.current;
  }, [isTyping, messageProcessingRef]);

  // Efeito para enviar o prompt inicial quando necessário
  useEffect(() => {
    if (initialPrompt && !initialPromptSentRef.current && !isLoading && !isTyping && messages.length === 0) {
      console.log("Enviando prompt inicial:", initialPrompt);
      initialPromptSentRef.current = true;
      handleSendMessage(initialPrompt, systemPrompt);
    }
  }, [initialPrompt, systemPrompt, isLoading, isTyping, messages.length, handleSendMessage]);

  return (
    <div className="flex flex-col h-full">
      <BookChat
        title={bookDetails.title}
        messages={messages}
        isLoading={isLoading}
        isTyping={isTyping}
        bookSlug={book}
        onSendMessage={handleSendMessage}
        loadingStage={loadingStage}
      />
    </div>
  );
};

export default BookChatContainer;
