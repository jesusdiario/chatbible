import { FC, useRef, useEffect, useState, UIEvent, KeyboardEvent } from 'react';
import Message from './Message';
import { Message as MessageType } from '@/types/chat';

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

const MessageList: FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, autoScroll]); // Add isTyping to dependencies to scroll when typing starts

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distance < 80;
    setAutoScroll(atBottom);
    setShowScrollBtn(!atBottom && distance > 160);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
    setShowScrollBtn(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
      scrollToBottom();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onKeyDown={handleKey}
      tabIndex={0}
      className="flex-1 overflow-y-auto outline-none relative overscroll-contain"
    >
      {/* Fade superior */}
      <div className="sticky top-0 h-6 bg-gradient-to-b from-white via-white to-transparent pointer-events-none z-10" />

      <div className="w-full max-w-3xl mx-auto px-4 pb-16">
        {messages.map((message, index) => (
          <Message key={message.id || index} {...message} /> // Use message.id if available
        ))}

        {/* Indicador de "Digitando..." melhorado */}
        {isTyping && (
          <div className="py-6 animate-fade-in">
            <div className="flex gap-4">
              {/* Avatar do Assistente */}
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                BC
              </div>
              <div className="flex-1">
                <div className="flex items-center h-8">
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

      {/* Botão flutuante “↓” */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute right-4 bottom-20 shadow-md rounded-full bg-white/80 backdrop-blur px-3 py-2 text-sm hover:bg-white transition z-10 border border-gray-200"
        >
          ↓ Novas mensagens
        </button>
      )}

      {/* --- Estilos para o indicador de digitação --- */}
      <style jsx>{`
        .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        .typing-indicator span {
          height: 8px;
          width: 8px;
          float: left;
          margin: 0 2px;
          background-color: #9E9E9E; /* Cinza */
          display: block;
          border-radius: 50%;
          opacity: 0.4;
          animation: typing-fade 1s infinite;
        }
        .typing-indicator span:nth-of-type(1) {
          animation-delay: 0s;
        }
        .typing-indicator span:nth-of-type(2) {
          animation-delay: 0.2s;
        }
        .typing-indicator span:nth-of-type(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing-fade {
          0% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default MessageList;
