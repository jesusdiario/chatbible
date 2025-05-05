
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import BookChat from '@/components/BookChat';
import { useChatState } from '@/hooks/useChatState';
import { useChatOperations } from '@/hooks/useChatOperations';
import ActionButtons from '@/components/ActionButtons';
import { useBooksContext } from '@/hooks/useBible';

// Utilizando interface para definir o tipo da localização
interface LocationState {
  initialPrompt?: string;
  promptOverride?: string;
}

const LivrosDaBibliaBook = () => {
  const { book, slug } = useParams();
  const location = useLocation();
  const { initialPrompt, promptOverride } = (location.state as LocationState) || {};
  const [promptSent, setPromptSent] = useState(false);

  const { messages, setMessages, isLoading, setIsLoading, userId } = useChatState({ slug });
  const { handleSendMessage, isTyping } = useChatOperations(
    book,
    userId,
    slug,
    messages,
    setMessages,
    setIsLoading,
  );

  const { books } = useBooksContext();
  const bookTitle = books?.find(b => b.slug === book)?.title || book;
  
  // Enviar prompt inicial caso exista
  useEffect(() => {
    if (initialPrompt && !promptSent && !isLoading) {
      handleSendMessage(initialPrompt, promptOverride);
      setPromptSent(true);
    }
  }, [initialPrompt, promptSent, isLoading, handleSendMessage, promptOverride]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-white pt-4 px-4">
      <div className="w-full max-w-4xl">
        <BookChat
          title={bookTitle || "Livro da Bíblia"}
          messages={messages}
          isLoading={isLoading}
          isTyping={isTyping}
          bookSlug={book}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default LivrosDaBibliaBook;
