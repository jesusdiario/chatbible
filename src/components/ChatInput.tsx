
import React from "react";
import { useToast } from "@/hooks/use-toast";
import SubscriptionModal from "@/components/SubscriptionModal";
import { supabase } from "@/integrations/supabase/client";
import { useMessageCount } from "@/hooks/useMessageCount";
import ChatMessageInput from "@/components/ChatMessageInput";
import MessageCounter from "@/components/MessageCounter";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  bookSlug?: string;
}

const ChatInput = ({ onSend, isLoading = false, bookSlug }: ChatInputProps) => {
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);
  const { toast } = useToast();
  const { 
    messageCount, 
    incrementMessageCount,
    loading: countLoading, 
    MESSAGE_LIMIT 
  } = useMessageCount();

  const handleSubmit = async (message: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("Usuário não autenticado");
        return;
      }

      if (messageCount >= MESSAGE_LIMIT) {
        setShowSubscriptionModal(true);
        toast({
          title: "Limite de mensagens atingido",
          description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
        });
        return;
      }

      // Registrar o uso da API será feito no fluxo do chatService
      await incrementMessageCount();
      
      if (messageCount + 1 >= MESSAGE_LIMIT) {
        setShowSubscriptionModal(true);
        toast({
          title: "Limite de mensagens atingido",
          description: `Você atingiu o limite de ${MESSAGE_LIMIT} mensagens mensais. Faça upgrade para o plano premium.`,
        });
      }

      onSend(message);
    } catch (error) {
      console.error("Erro ao processar envio de mensagem:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center">
      <ChatMessageInput 
        onSend={handleSubmit}
        isLoading={isLoading || countLoading}
        bookSlug={bookSlug}
      />
      <MessageCounter 
        currentCount={messageCount}
        limit={MESSAGE_LIMIT}
        isLoading={countLoading}
      />
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default ChatInput;
