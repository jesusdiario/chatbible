
import React from 'react';
import BookChat from './BookChat';
import { loadChatMessages } from '@/services/chatService';
import { useChatState } from '@/hooks/useChatState';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';
import { BibleBook } from '@/types/bible';
import { useChatOperations } from '@/hooks/useChatOperations';
import { supabase } from '@/integrations/supabase/client';  // Add the missing import

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
    userId,
    setChatHistory
  } = useChatState({ book, slug });

  const {
    isTyping,
    handleSendMessage,
    messageProcessingRef
  } = useChatOperations({ 
    book, 
    slug, 
    userId,
    onHistoryUpdate: async () => {
      if (userId) {
        const { data: chatHistory } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('last_accessed', { ascending: false });

        if (chatHistory) {
          const formattedHistory = chatHistory.map(item => ({
            id: item.id,
            title: item.title,
            lastAccessed: new Date(item.last_accessed),
            user_id: item.user_id,
            book_slug: item.book_slug,
            last_message: item.last_message,
            slug: item.slug
          }));
          setChatHistory(formattedHistory);
        }
      }
    }
  });

  // Recarrega as mensagens quando a visibilidade da página muda
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
