
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
    
    // Tipagem explícita para o atualizador do state
    setMessages((prev: Message[]) => [...prev, userMessage]);
    
    try {
      setIsTyping(true);
      
      const assistantMessage: Message = { role: "assistant", content: "" };
      
      // Tipagem explícita para o atualizador do state
      setMessages((prev: Message[]) => [...prev, assistantMessage]);
      
      const filteredMessages = messages.filter(m => m.role === "user" || (m.role === "assistant" && m.content.trim() !== ""));
      
      const result = await sendChatMessage(
        content, 
        filteredMessages, 
        book, 
        userId || undefined, 
        slug,
        undefined,
        (chunk) => {
          // Não dependemos mais do estado de visibilidade aqui 
          // O chatService.ts agora gerencia isso internamente
          setMessages((prev: Message[]) => {
            const newMsgs = [...prev];
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
      
      // Tipagem explícita para o atualizador do state
      setMessages((prev: Message[]) => {
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
      
      // Sempre definimos como false após a conclusão
      // independentemente do estado de visibilidade
      messageProcessingRef.current = false;
    }
  }, [messages, book, userId, slug, navigate, setMessages, setIsLoading]);

  return {
    handleSendMessage,
    isTyping,
    messageProcessingRef,
    lastMessageRef
  };
};
