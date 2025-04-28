import {
  FC,
  useRef,
  useEffect,
  useState,
  UIEvent,
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
  const [autoScroll, setAutoScroll] = useState(true);

  /* Rola para o fim apenas se autoScroll estiver ativo */
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  /* Detecta quando o usuário sobe a lista e desliga o auto-scroll */
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distanceFromBottom < 80); // cola apenas se faltar < 80 px
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
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
    </div>
  );
};

export default MessageList;