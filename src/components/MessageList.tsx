import { FC, useRef, useEffect, useState, UIEvent } from 'react';
…
const MessageList: FC<MessageListProps> = ({ messages, isTyping = false }) => {
  const containerRef      = useRef<HTMLDivElement>(null);
  const messagesEndRef    = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);   // ⬅️ NEW

  /* 1. Decide quando deve rolar */
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  /* 2. Monitora se o usuário subiu a página */
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(distanceFromBottom < 80); // só “cola” se estiver a < 80 px do fim
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto"
    >
      …
      <div ref={messagesEndRef} />
    </div>
  );
};