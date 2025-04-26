
import { useCallback, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import { sendChatMessage } from '@/services/chatService';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useChatOperations = (
  book?: string,
  userId?: string | null,
  slug?: string,
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const navigate = useNavigate();
  const messageProcessingRef = useRef<boolean>(false);
  const lastMessageRef = useRef<string>('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    messageProcessingRef.current = true;
    lastMessageRef.current = content;

    const userMessage: Message = { role: "user", content };
    setMessages([...messages, userMessage]);
    
    try {
      setIsTyping(true);
      
      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages(prev => [...prev, assistantMessage]);
      
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
  }, [messages, book, userId, slug, navigate, setMessages]);

  return {
    handleSendMessage,
    isTyping,
    messageProcessingRef,
    lastMessageRef
  };
};
