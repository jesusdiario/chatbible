
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionModal from "@/components/SubscriptionModal";
import { useMessageCount } from "@/hooks/useMessageCount";
import MessageInputField from "@/components/MessageInputField";
import MessageLimitCounter from "@/components/MessageLimitCounter";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const ChatInput = ({ 
  onSend, 
  isLoading = false, 
  placeholder = "Sua dúvida bíblica" 
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  
  // Limit settings
  const MESSAGE_LIMIT = 10; // Maximum number of messages allowed
  const RESET_TIME = 30 * 24 * 60 * 60 * 1000; // Reset time in milliseconds (30 days)
  
  const { 
    count, 
    loading, 
    incrementCount, 
    hasReachedLimit 
  } = useMessageCount(MESSAGE_LIMIT, RESET_TIME);

  const handleSubmit = async () => {
    if (message.trim() && !isLoading && !loading) {
      try {
        // Check if user has reached message limit
        if (hasReachedLimit) {
          setShowSubscriptionModal(true);
          toast({
            title: "Limite de mensagens atingido",
            description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
          });
          return;
        }
        
        // Increment message counter
        const success = await incrementCount();
        if (!success) {
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao processar sua mensagem. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
        
        // Check if limit reached after this message
        if (count + 1 >= MESSAGE_LIMIT) {
          setShowSubscriptionModal(true);
          toast({
            title: "Limite de mensagens atingido",
            description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
          });
        }
        
        // Send message
        onSend(message);
        setMessage("");
      } catch (error) {
        console.error("Error processing message sending:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente.",
          variant: "destructive"
        });
      }
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
      <MessageInputField
        message={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
        isDisabled={isLoading || loading}
        isLoading={isLoading || loading}
        placeholder={placeholder}
      />
      
      <MessageLimitCounter 
        current={count}
        limit={MESSAGE_LIMIT}
        isLoading={loading}
      />
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default ChatInput;
