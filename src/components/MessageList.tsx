
import { FC, useRef, useEffect, useState } from 'react';
import Message from './Message';
import { Message as MessageType } from '@/types/chat';
import { Button } from './ui/button';
import { ChevronUp } from 'lucide-react';

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

const MessageList: FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  
  // Check if we need to show the scroll to bottom button
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    
    setShowScrollToBottom(scrolledUp);
    
    if (scrollHeight - scrollTop - clientHeight < 10) {
      setIsAutoScrollEnabled(true);
    } else if (messages.length > 0 && !isTyping) {
      setIsAutoScrollEnabled(false);
    }
  };
  
  // Scroll to bottom on new messages when auto scroll is enabled
  useEffect(() => {
    if (isAutoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isAutoScrollEnabled]);
  
  // Scroll to bottom manually when button is clicked
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAutoScrollEnabled(true);
  };
  
  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-y-auto" 
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
          messages.map((message, index) => (
            <Message key={index} {...message} />
          ))
        )}
        
        {isTyping && (
          <div className="py-6">
            <div className="flex gap-4">
              <div className="h-8 w-8 rounded-full bg-[#F7F7F8] flex items-center justify-center">
                <span className="text-sm">BC</span>
              </div>
              <div className="flex-1">
                <div className="prose prose-invert max-w-none">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {showScrollToBottom && (
        <div className="fixed bottom-24 right-8 z-10">
          <Button 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-lg"
            onClick={scrollToBottom}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageList;
