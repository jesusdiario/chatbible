
import { useEffect, useRef } from 'react';
import Message from './Message';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const MessageList = ({ messages }: { messages: Message[] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-4">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
