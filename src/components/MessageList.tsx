
import { FC, useRef, useEffect, useState, useCallback } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import Message from './Message';
import { Message as MessageType } from '@/types/chat';
import { Button } from './ui/button';
import { ChevronUp } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

const MessageList: FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(100);
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  // Função otimizada para verificar a posição de rolagem
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    const currentProgress = Math.min(
      100,
      Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) || 100
    );
    
    setShowScrollToBottom(scrolledUp);
    setScrollProgress(scrolledUp ? currentProgress : 100);
    
    if (scrollHeight - scrollTop - clientHeight < 20) {
      setIsAutoScrollEnabled(true);
    } else if (messages.length > 0 && !isTyping) {
      setIsAutoScrollEnabled(false);
    }
  }, [messages, isTyping]);
  
  // Rolagem suave para o final
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior, 
        block: 'end' 
      });
      setIsAutoScrollEnabled(true);
    }
  }, []);
  
  // Efeito para rolagem automática quando novas mensagens chegam
  useEffect(() => {
    if (isAutoScrollEnabled && messagesEndRef.current) {
      // Usa comportamento diferente entre desktop e mobile
      const scrollBehavior = isMobile ? 'auto' : 'smooth';
      
      // Adiciona uma pequena pausa antes de rolar no mobile para não ser tão abrupto
      if (isMobile) {
        setTimeout(() => scrollToBottom(scrollBehavior), 100);
      } else {
        scrollToBottom(scrollBehavior);
      }
    }
  }, [messages, isTyping, isAutoScrollEnabled, scrollToBottom, isMobile]);
  
  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-y-auto scroll-smooth" 
      onScroll={handleScroll}
    >
      <div className="w-full max-w-4xl mx-auto px-4 pb-24">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">CHAT A.I+</h1>
              <p className="text-xl mb-8">Good day! How may I assist you today?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                  {
                    title: '"Explain"',
                    icon: "📚",
                    description: "Quantum computing in simple terms"
                  },
                  {
                    title: '"How to"',
                    icon: "🔍",
                    description: "Make a search engine platform like google"
                  },
                  {
                    title: '"Remember"',
                    icon: "🧠",
                    description: "quantum computing in simple terms"
                  },
                  {
                    title: '"Allows"',
                    icon: "✅",
                    description: "User to provide follow-up corrections"
                  }
                ].map((card, index) => (
                  <div key={index} className="border rounded-lg p-4 flex items-start gap-3 hover:bg-gray-50 cursor-pointer">
                    <div className="text-2xl">{card.icon}</div>
                    <div>
                      <h3 className="font-semibold">{card.title}</h3>
                      <p className="text-sm text-gray-500">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Message 
                key={index} 
                {...message} 
                showActions={!isTyping || index < messages.length - 1}
              />
            ))}
            
            {isTyping && (
              <Message 
                role="assistant" 
                content="" 
                isTyping={true} 
              />
            )}
          </>
        )}
        
        <div ref={messagesEndRef} className="h-1" />
      </div>
      
      {showScrollToBottom && (
        <div className="fixed bottom-24 right-8 z-10 flex flex-col items-center space-y-2">
          <Progress value={scrollProgress} className="w-12 h-1 bg-gray-200" />
          <Button 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-lg bg-white text-black hover:bg-gray-100"
            onClick={() => scrollToBottom()}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageList;
