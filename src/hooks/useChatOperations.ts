
import { useCallback, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import { sendChatMessage } from '@/services/chatService';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useChatOperations = (
  book: string | undefined,
  userId: string | null,
  slug: string | undefined,
  messages: Message[],
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
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
    setMessages(prev => [...prev, userMessage]);
    
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
          // Verifica se a página está visível antes de atualizar a UI
          if (document.visibilityState === 'visible') {
            setMessages(prev => {
              const newMsgs = [...prev];
              const lastMsg = newMsgs[newMsgs.length - 1];
              if (lastMsg && lastMsg.role === 'assistant') {
                lastMsg.content = (lastMsg.content || '') + chunk;
              }
              return newMsgs;
            });
          }
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
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { 
          role: "assistant", 
          content: "Ocorreu um erro: " + (err?.message || "Erro inesperado") 
        };
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      
      // Verificamos novamente o estado de visibilidade após completar
      // e só atualizamos a flag se a página estiver visível
      if (document.visibilityState === 'visible') {
        messageProcessingRef.current = false;
      }
    }
  }, [messages, book, userId, slug, navigate, setMessages, setIsLoading]);

  return {
    handleSendMessage,
    isTyping,
    messageProcessingRef,
    lastMessageRef
  };
};
