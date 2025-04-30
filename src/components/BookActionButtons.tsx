
import React, { useContext } from "react";
import { ChatContext } from "./ActionButtons";
import { useBibleSuggestions } from "@/hooks/useBibleSuggestions";
import { useMessageCount } from "@/hooks/useMessageCount";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

interface BookActionButtonsProps {
  /** slug do livro bíblico  */
  bookSlug: string;
  /** se true, será renderizado dentro de um modal */
  displayInModal?: boolean;
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
  bookSlug,
  displayInModal = false,
}: BookActionButtonsProps) => {
  /* ------------ CONTEXTOS / HOOKS --------------------------------- */
  const { sendMessage } = useContext(ChatContext);

  const { data: suggestions, isLoading } = useBibleSuggestions(bookSlug);

  const {
    messageCount,
    messageLimit,
    canSendMessage,
    incrementMessageCount,
  } = useMessageCount();

  const { getStripePriceIdByCode, startCheckout } = useSubscription();

  /* ------------ HANDLERS ------------------------------------------ */
  const handleButtonClick = async (suggestion: Suggestion) => {
    if (!canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens.",
        variant: "destructive",
      });
      return;
    }

    if (!sendMessage) return;

    // Send message (with optional override)
    suggestion.prompt_override
      ? sendMessage(suggestion.user_message, suggestion.prompt_override)
      : sendMessage(suggestion.user_message);

    await incrementMessageCount();
  };

  const handleUpgradeClick = () => {
    const stripePriceId = getStripePriceIdByCode('PRO');
    if (stripePriceId) {
      startCheckout(stripePriceId);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar o plano. Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  /* ------------ EARLY-RETURNS ------------------------------------- */
  if (isLoading) {
    return <div className="flex justify-center mt-4">Carregando sugestões…</div>;
  }

  if (!suggestions || suggestions.length === 0) return null;

  // this component should only be rendered inside the modal
  if (!displayInModal) return null;

  /* ------------ UI ------------------------------------------------- */
  // (1) Warning / upgrade button if the limit has been reached
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

  // (2) List of suggestions - scrollable container
  return (
    <div
      className="
        grid grid-cols-1 gap-4 mt-4
        max-h-[70vh] overflow-y-auto pr-2       /* internal scrolling      */
      "
    >
      {suggestions.map((suggestion) => (
        <Card
          key={suggestion.id}
          onClick={() => handleButtonClick(suggestion)}
          className="
            flex flex-col items-center p-4 cursor-pointer
            border hover:border-[#4483f4] transition-all
          "
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[14px] font-medium">
              {suggestion.label}
            </span>
          </div>

          {/* Optional tooltip for description -------------------------------- */}
          {suggestion.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-xs text-gray-400 hover:text-gray-600">
                    ?
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">
                    {suggestion.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Card>
      ))}
    </div>
  );
};

export default BookActionButtons;
