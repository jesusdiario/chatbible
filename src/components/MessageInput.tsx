
import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSubmit: (message: string) => void;
  isDisabled: boolean;
  isLoading: boolean;
}

const MessageInput = ({ onSubmit, isDisabled, isLoading }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim() && !isDisabled) {
      onSubmit(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Sua dúvida bíblica"
        className="w-full resize-none rounded-full bg-[#2F2F2F] px-4 py-4 pr-12 focus:outline-none"
        style={{ maxHeight: "200px" }}
        disabled={isDisabled}
      />
      <button 
        onClick={handleSubmit}
        disabled={isDisabled || !message.trim()}
        className="absolute right-3 top-[50%] -translate-y-[50%] p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default MessageInput;
