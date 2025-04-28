import React, { UIEvent, useEffect, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import MessageItem from './Message';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const containerRef   = useRef<HTMLDivElement>(null);
  const endRef         = useRef<HTMLDivElement>(null);

  /** Se o usuário estiver a < 80 px do fim, rolagem automática continua ativa */
  const [autoScroll, setAutoScroll] = useState(true);

  /** Desliga/religa auto-scroll conforme o usuário sobe ou desce a lista */
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distance < 80);
  };

  /** Só força rolagem quando autoScroll === true */
  useEffect(() => {
    if (autoScroll) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, autoScroll]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-4 py-2 space-y-4"
    >
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}

      {isTyping && (
        <MessageItem
          key="typing"
          message={{ id: 'typing', role: 'assistant', content: '…' }}
        />
      )}

      <div ref={endRef} />
    </div>
  );
};

export default MessageList;