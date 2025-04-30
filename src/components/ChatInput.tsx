
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { useMessageCount } from '@/hooks/useMessageCount';
import MessageCounter from './MessageCounter';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/components/ui/use-toast';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  bookSlug?: string;
}

const ChatInput = ({ onSend, isLoading, bookSlug }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messageCount, messageLimit, canSendMessage, loading, increment, daysUntilReset } = useMessageCount();
  const { startCheckout } = useSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    if (!canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens.",
        variant: "destructive",
      });
      return;
    }
    
    // Send message
    onSend(message.trim());
    
    // Increment counter
    increment();
    
    // Clear input
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

  const handleUpgradeClick = () => {
    startCheckout('price_1OeVptLyyMwTutR9oFF1m3aC'); // Pass the premium plan price ID
  };

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
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <MessageCounter 
        currentCount={messageCount} 
        limit={messageLimit} 
        isLoading={loading} 
        daysUntilReset={daysUntilReset}
      />
      
      {!canSendMessage && !loading && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
          <p className="text-red-700 mb-2">
            Você atingiu seu limite mensal de mensagens. Faça upgrade para o plano premium para enviar mais mensagens.
          </p>
          <Button 
            onClick={handleUpgradeClick} 
            variant="default" 
            size="sm" 
            className="w-full"
          >
            Fazer upgrade para Premium
          </Button>
        </div>
      )}
    </form>
  );
};

export default ChatInput;
