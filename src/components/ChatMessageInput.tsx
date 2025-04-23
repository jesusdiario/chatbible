
import React, { useState, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface ChatMessageInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  bookSlug?: string;
}

const ChatMessageInput = ({ onSend, isLoading, disabled, bookSlug }: ChatMessageInputProps) => {
  const [message, setMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("Sua dúvida bíblica");
  
  // Ajusta o placeholder com base no livro atual (se existir)
  useEffect(() => {
    if (bookSlug) {
      // Primeira letra maiúscula
      const formattedBookName = bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1);
      setPlaceholder(`Pergunte algo sobre ${formattedBookName}...`);
    } else {
      setPlaceholder("Sua dúvida bíblica");
    }
  }, [bookSlug]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !disabled) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  return (
    <div className="relative w-full">
      <textarea
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder}
        className="w-full resize-none rounded-full bg-chat-input-bg px-4 py-4 pr-12 focus:outline-none transition-all duration-200 text-text-primary"
        style={{ maxHeight: "200px" }}
        disabled={isLoading || disabled}
        aria-label="Campo de mensagem"
      />
      <button 
        onClick={handleSubmit}
        disabled={isLoading || !message.trim() || disabled}
        className="absolute right-3 top-[50%] -translate-y-[50%] p-1.5 bg-send-btn-bg rounded-full hover:bg-send-btn-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Enviar mensagem"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        ) : (
          <ArrowUp className="h-4 w-4 text-white" />
        )}
      </button>
    </div>
  );
};

export default ChatMessageInput;
