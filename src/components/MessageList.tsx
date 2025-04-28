import {
  FC,
  useRef,
  useEffect,
  useState,
  UIEvent,
  KeyboardEvent,
} from 'react';
import Message from './Message';
import { Message as MessageType } from '@/types/chat';

interface MessageListProps {
  messages: MessageType[];
  isTyping?: boolean;
}

const MessageList: FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const containerRef   = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** true ⇢ rolar automaticamente; false ⇢ usuário está lendo acima */
  const [autoScroll, setAutoScroll]   = useState(true);
  /** Exibe o botão flutuante quando dist > 160 px */
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  /* Força rolagem para o fim apenas se autoScroll estiver ativo */
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  /* Detecta quando o usuário sobe a lista e desliga o auto-scroll */
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;

    const atBottom = distance < 80;
    setAutoScroll(atBottom);
    setShowScrollBtn(!atBottom && distance > 160); // botão só com folga maior
  };

  /* Rola manualmente para o fim e reativa auto-scroll */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
    setShowScrollBtn(false);
  };

  /* PageDown ou Space (⇧Space = sobe) restauram o scroll automático */
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
      tabIndex={0}                 /* permite capturar teclas */
      className="flex-1 overflow-y-auto outline-none relative overscroll-contain"
    >
      {/* Fade superior */}
      <div className="fade-top absolute inset-x-0 top-0 h-6 pointer-events-none" />

      <div className="w-full max-w-3xl mx-auto px-4 pb-16">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}

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

      {/* Botão flutuante “↓” */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute right-4 bottom-6 shadow-md rounded-full bg-white/80 backdrop-blur px-3 py-2 text-sm hover:bg-white transition"
        >
          ↓ Novas mensagens
        </button>
      )}

      {/* --- Estilos extras --- */}
      <style jsx>{`
        .fade-top {
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent);
        }
      `}</style>
    </div>
  );
};

export default MessageList;