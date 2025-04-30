
import React, { useContext } from "react";
import { Send } from 'lucide-react';
import { ChatContext } from "./ActionButtons";
import { useBibleSuggestions } from "@/hooks/useBibleSuggestions";
import { useMessageCount } from "@/hooks/useMessageCount";
import { toast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

interface BookActionButtonsProps {
  bookSlug: string;
  displayInModal?: boolean; // Nova prop para determinar se os botões estão sendo exibidos no modal
}

export interface Suggestion {
  id: string;
  label: string;
  user_message: string;
  icon?: string;
  prompt_override?: string;
  description?: string;
}

const BookActionButtons = ({ bookSlug, displayInModal = false }: BookActionButtonsProps) => {
  const { sendMessage } = useContext(ChatContext);
  const { data: suggestions, isLoading } = useBibleSuggestions(bookSlug);
  const { messageCount, messageLimit, canSendMessage, incrementMessageCount } = useMessageCount();
  const { startCheckout } = useSubscription();

  const handleButtonClick = (suggestion: Suggestion) => {
    if (!canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens.",
        variant: "destructive",
      });
      return;
    }
    
    if (sendMessage) {
      if (suggestion.prompt_override) {
        sendMessage(suggestion.user_message, suggestion.prompt_override);
      } else {
        sendMessage(suggestion.user_message);
      }
      
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

  // Se não estiver sendo exibido no modal e displayInModal for false, não renderizar nada
  if (!displayInModal) {
    return null;
  }

  // If user can't send messages, show upgrade button
  if (!canSendMessage) {
    return (
      <div className="flex flex-col items-center gap-3 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-700">
          Você atingiu seu limite de {messageLimit} mensagens neste mês.
        </p>
        <button
          onClick={handleUpgradeClick}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm transition-colors"
        >
          Fazer upgrade para continuar
        </button>
      </div>
    );
  }

  // Layout modificado para duas colunas
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {suggestions.map((suggestion) => {
        return (
          <Card
            key={suggestion.id}
            className="flex flex-col items-center p-4 cursor-pointer border hover:border-[#4483f4] transition-all"
            onClick={() => handleButtonClick(suggestion)}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[14px] font-medium">{suggestion.label}</span>
              <Send className="h-4 w-4 text-[#4483f4]" />
            </div>
            {suggestion.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-xs text-gray-400 hover:text-gray-600">?</div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">{suggestion.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BookActionButtons;
