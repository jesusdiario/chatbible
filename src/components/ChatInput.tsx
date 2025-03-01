
import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { useMessageCount } from "@/hooks/useMessageCount";
import SubscriptionModal from "@/components/SubscriptionModal";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSend, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { count, loading, incrementCount } = useMessageCount();
  
  const handleSubmit = async () => {
    if (message.trim() && !isLoading && !loading) {
      // Try to increment the message count
      const { success, limitReached } = await incrementCount();
      
      if (!success) {
        // If limit reached, show the subscription modal
        if (limitReached) {
          setShowSubscriptionModal(true);
        }
        return;
      }
      
      // Send the message
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative w-full">
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Sua dúvida bíblica"
          className="w-full resize-none rounded-full bg-[#2F2F2F] px-4 py-4 pr-12 focus:outline-none"
          style={{ maxHeight: "200px" }}
          disabled={isLoading || loading}
        />
        <button 
          onClick={handleSubmit}
          disabled={isLoading || !message.trim() || loading}
          className="absolute right-3 top-[50%] -translate-y-[50%] p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || loading ? (
            <Loader2 className="h-4 w-4 text-black animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 text-black" />
          )}
        </button>
      </div>
      
      {!loading && (
        <div className="w-full text-xs text-gray-500 mt-1 text-right">
          {count}/10 mensagens enviadas este mês
        </div>
      )}
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default ChatInput;
