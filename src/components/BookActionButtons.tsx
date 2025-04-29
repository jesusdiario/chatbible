
import React, { useContext } from "react";
import { icons } from 'lucide-react';
import { ChatContext } from "./ActionButtons";
import { useBibleSuggestions } from "@/hooks/useBibleSuggestions";
import { Suggestion } from "@/services/suggestionsService";
import { useMessageCount } from "@/hooks/useMessageCount";
import { toast } from "@/hooks/use-toast";

interface BookActionButtonsProps {
  bookSlug: string;
}

const BookActionButtons = ({ bookSlug }: BookActionButtonsProps) => {
  const { sendMessage } = useContext(ChatContext);
  const { data: suggestions, isLoading } = useBibleSuggestions(bookSlug);
  const { messageCount, MESSAGE_LIMIT, incrementMessageCount, canSendMessage } = useMessageCount();

  const handleButtonClick = (suggestion: Suggestion) => {
    if (!canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens. Faça upgrade para o plano premium para enviar mais mensagens.",
        variant: "destructive",
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

  if (isLoading) {
    return <div className="flex justify-center mt-4">Carregando sugestões...</div>;
  }

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {suggestions?.map((suggestion) => {
        const IconComponent = suggestion.icon ? icons[suggestion.icon as keyof typeof icons] : undefined;
        return (
          <button 
            key={suggestion.id} 
            className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#4483f4] px-3 py-2 text-[#4483f4] text-[13px] shadow-xxs transition enabled:hover:bg-token-main-surface-secondary disabled:cursor-not-allowed xl:gap-2 xl:text-[14px]"
            onClick={() => handleButtonClick(suggestion)}
            disabled={!canSendMessage}
          >
            {IconComponent && <IconComponent className="h-4 w-4 text-[#4483f4]-400" />}
            {suggestion.label}
          </button>
        );
      })}
    </div>
  );
};

export default BookActionButtons;
