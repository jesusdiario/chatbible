
import React, { ChangeEvent, KeyboardEvent, useRef, useEffect } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface MessageInputFieldProps {
  message: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  placeholder: string;
}

const MessageInputField = ({
  message, 
  onChange, 
  onKeyDown, 
  onSubmit, 
  isDisabled, 
  isLoading, 
  placeholder
}: MessageInputFieldProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [message]);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        rows={1}
        value={message}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full resize-none rounded-full bg-[#2F2F2F] px-4 py-4 pr-12 focus:outline-none text-white"
        style={{ maxHeight: "200px", minHeight: "40px" }}
        disabled={isDisabled}
        aria-label="Mensagem"
      />
      <button 
        onClick={onSubmit}
        disabled={isDisabled || !message.trim()}
        className="absolute right-3 top-[50%] -translate-y-[50%] p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={isLoading ? "Enviando..." : "Enviar mensagem"}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 text-black animate-spin" />
        ) : (
          <ArrowUp className="h-4 w-4 text-black" />
        )}
      </button>
    </div>
  );
};

export default MessageInputField;
