
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { useMessageCount } from '@/hooks/useMessageCount';
import MessageCounter from './MessageCounter';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  bookSlug?: string;
}

const ChatInput = ({ onSend, isLoading, bookSlug }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messageCount, MESSAGE_LIMIT, incrementMessageCount, canSendMessage, loading } = useMessageCount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || !canSendMessage) return;
    
    onSend(message.trim());
    incrementMessageCount(); // Incrementa o contador quando uma mensagem é enviada
    setMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height - necessary to shrink on backspace
      textarea.style.height = 'auto';
      // Set new height
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  // Adjust height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative rounded-md shadow-sm border">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Faça uma pergunta sobre ${bookSlug || 'a Bíblia'}...`}
          className="pr-10 resize-none min-h-[45px] max-h-[200px] overflow-y-auto"
          disabled={isLoading || !canSendMessage}
          rows={1}
        />
        <div className="absolute right-2 bottom-1">
          <Button 
            size="icon" 
            variant="ghost" 
            type="submit" 
            disabled={!message.trim() || isLoading || !canSendMessage}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <MessageCounter currentCount={messageCount} limit={MESSAGE_LIMIT} isLoading={loading} />
      
      {!canSendMessage && !loading && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          Você atingiu seu limite mensal de mensagens. Faça upgrade para o plano premium.
        </div>
      )}
    </form>
  );
};

export default ChatInput;
