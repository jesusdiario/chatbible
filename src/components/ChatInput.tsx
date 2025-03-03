
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionModal from "@/components/SubscriptionModal";
import MessageInput from "@/components/MessageInput";
import MessageCounter from "@/components/MessageCounter";
import { useMessageCount, MESSAGE_LIMIT } from "@/hooks/useMessageCount";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSend, isLoading = false }: ChatInputProps) => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  const { 
    messageCount, 
    loading, 
    hasReachedLimit, 
    incrementMessageCount 
  } = useMessageCount();
  
  const handleSubmit = async (message: string) => {
    if (hasReachedLimit()) {
      setShowSubscriptionModal(true);
      toast({
        title: "Limite de mensagens atingido",
        description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
      });
      return;
    }
    
    const success = await incrementMessageCount();
    if (success) {
      onSend(message);
      
      // Verificar se atingiu o limite após esta mensagem
      if (hasReachedLimit()) {
        setShowSubscriptionModal(true);
        toast({
          title: "Limite de mensagens atingido",
          description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
        });
      }
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      <MessageInput 
        onSubmit={handleSubmit}
        isDisabled={isLoading || loading}
        isLoading={isLoading}
      />
      
      {!loading && (
        <MessageCounter 
          currentCount={messageCount} 
          maxCount={MESSAGE_LIMIT} 
          className="w-full mt-1 text-right" 
        />
      )}
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default ChatInput;
