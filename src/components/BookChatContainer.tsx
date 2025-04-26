import React, { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BookChat from './BookChat';
import { loadChatMessages } from '@/services/chatService';
import { useChatState } from '@/hooks/useChatState';
import { useVisibilityChange } from '@/hooks/useVisibilityChange';
import { BibleBook } from '@/types/bible';
import { sendChatMessage } from '@/services/chatService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();
  const messageProcessingRef = useRef<boolean>(false);
  const lastMessageRef = useRef<string>('');
  const [isTyping, setIsTyping] = React.useState(false);
  
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    userId,
    chatHistory,
    setChatHistory
  } = useChatState({ book, slug });

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    messageProcessingRef.current = true;
    lastMessageRef.current = content;

    const userMessage = { role: "user", content };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      setIsTyping(true);
      
      const assistantMessage = { role: "assistant", content: "" };
      setMessages(prevMsgs => [...prevMsgs, assistantMessage]);
      
      const result = await sendChatMessage(
        content, 
        messages.filter(m => m.role === "user" || (m.role === "assistant" && m.content.trim() !== "")), 
        book, 
        userId || undefined, 
        slug,
        undefined,
        (chunk) => {
          setMessages(prevMsgs => {
            const newMsgs = [...prevMsgs];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = (lastMsg.content || '') + chunk;
            }
            return newMsgs;
          });
        }
      );
      
      if (!slug && book) {
        navigate(`/livros-da-biblia/${book}/${result.slug}`);
      }

      if (userId) {
        const { data: updatedHistory } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('last_accessed', { ascending: false });

        if (updatedHistory) {
          const formattedHistory = updatedHistory.map(item => ({
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
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err?.message || "Erro inesperado ao enviar mensagem",
        variant: "destructive",
      });
      setMessages(prevMsgs => {
        const newMsgs = [...prevMsgs];
        newMsgs[newMsgs.length - 1] = { 
          role: "assistant", 
          content: "Ocorreu um erro: " + (err?.message || "Erro inesperado") 
        };
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      messageProcessingRef.current = false;
    }
  }, [messages, book, userId, slug, navigate, setMessages, setChatHistory]);

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
