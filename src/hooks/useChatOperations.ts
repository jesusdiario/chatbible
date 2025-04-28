
import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Message, SendMessageResponse } from '@/types/chat';
import { sendChatMessage } from '@/services/chatService';

interface UseChatOperationsProps {
  book?: string;
  slug?: string;
  userId: string | null;
  onHistoryUpdate?: () => void;
}

export function useChatOperations({ 
  book, 
  slug, 
  userId,
  onHistoryUpdate 
}: UseChatOperationsProps) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messageProcessingRef = useRef<boolean>(false);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    setIsLoading(true);
    messageProcessingRef.current = true;

    const userMessage: Message = { role: "user", content };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      setIsTyping(true);
      
      const assistantMessage: Message = { role: "assistant", content: "" };
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
      
      if (!slug && book && result.slug) {
        navigate(`/livros-da-biblia/${book}/${result.slug}`);
      }

      if (onHistoryUpdate) {
        onHistoryUpdate();
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
  }, [messages, book, userId, slug, navigate, isLoading, onHistoryUpdate]);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    isTyping,
    messageProcessingRef,
    handleSendMessage
  };
}
