import React, { useContext } from "react";
import { icons } from 'lucide-react';
import { ChatContext } from "./ActionButtons";
import { useBibleSuggestions } from "@/hooks/useBibleSuggestions";
import { useMessageCount } from "@/hooks/useMessageCount";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface BookActionButtonsProps {
  bookSlug: string;
}
export interface Suggestion {
  id: string;
  label: string;
  user_message: string;
  icon?: string;
  prompt_override?: string;
  description?: string;
}
const BookActionButtons = ({
  bookSlug
}: BookActionButtonsProps) => {
  const {
    sendMessage
  } = useContext(ChatContext);
  const {
    data: suggestions,
    isLoading
  } = useBibleSuggestions(bookSlug);
  const {
    messageCount,
    messageLimit,
    canSendMessage,
    incrementMessageCount
  } = useMessageCount();
  const {
    startCheckout
  } = useSubscription();
  const handleButtonClick = (suggestion: Suggestion) => {
    if (!canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens.",
        variant: "destructive"
      });
      return;
    }
    if (sendMessage) {
      if (suggestion.prompt_override) {
        // If there's a prompt override, we'll prepend it as a system message
        // Note: this is handled in the chat service
        sendMessage(suggestion.user_message, suggestion.prompt_override);
      } else {
        sendMessage(suggestion.user_message);
      }

      // Incrementa o contador de mensagens quando uma sugestão é clicada
      incrementMessageCount();
    }
  };
  const handleUpgradeClick = () => {
    startCheckout('price_1OeVptLyyMwTutR9oFF1m3aC'); // Use your premium plan price ID
  };
  if (isLoading) {
    return <div className="flex justify-center mt-4">Carregando sugestões...</div>;
  }

  // No suggestions available
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  // If user can't send messages, show upgrade button
  if (!canSendMessage) {
    return <div className="flex flex-col items-center gap-3 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-700">
          Você atingiu seu limite de {messageLimit} mensagens neste mês.
        </p>
        <button onClick={handleUpgradeClick} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm transition-colors">
          Fazer upgrade para continuar
        </button>
      </div>;
  }
  return;
};
export default BookActionButtons;