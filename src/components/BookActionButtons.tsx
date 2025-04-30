
import React, { useContext } from "react";
import { icons } from 'lucide-react';
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

  // Novo layout com Cards para os botões, semelhante aos cards dos livros
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {suggestions.map((suggestion) => {
        const IconComponent = suggestion.icon ? icons[suggestion.icon as keyof typeof icons] : undefined;
        
        return (
          <Card
            key={suggestion.id}
            className="flex flex-col items-center p-4 cursor-pointer border hover:border-[#4483f4] transition-all"
            onClick={() => handleButtonClick(suggestion)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-5 w-5 text-[#4483f4]" />}
                <span className="font-medium">{suggestion.label}</span>
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
          </Card>
        );
      })}
    </div>
  );
};

export default BookActionButtons;
