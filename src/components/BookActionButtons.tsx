
import React, { useContext } from "react";
import { Send } from "lucide-react";
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
    increment: incrementMessageCount,
  } = useMessageCount();

  const { startCheckout } = useSubscription();

  /* ------------ HANDLERS ------------------------------------------ */
  const handleButtonClick = async (suggestion: Suggestion) => {
    // Check if the user can send a message first
    if (!canSendMessage) {
      toast({
        title: "Limite de mensagens atingido",
        description: "Você atingiu seu limite mensal de mensagens.",
        variant: "destructive",
      });
      return;
    }

    // Try to increment the message count
    const canProceed = await incrementMessageCount();
    if (!canProceed) return;
    
    if (!sendMessage) return;

    // Envia mensagem (com override opcional)
    suggestion.prompt_override
      ? sendMessage(suggestion.user_message, suggestion.prompt_override)
      : sendMessage(suggestion.user_message);
  };

  const handleUpgradeClick = () => {
    // ID do preço do seu plano premium
    startCheckout("price_1RJfFtLyyMwTutR95rlmrvcA");
  };

  /* ------------ EARLY-RETURNS ------------------------------------- */
  if (isLoading) {
    return <div className="flex justify-center mt-4">Carregando sugestões…</div>;
  }

  if (!suggestions || suggestions.length === 0) return null;

  // este componente só deve ser renderizado dentro do modal
  if (!displayInModal) return null;

  /* ------------ UI ------------------------------------------------- */
  // (1) Aviso / botão de upgrade caso tenha atingido o limite
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

  // (2) Lista de sugestões – container rolável
  return (
    <div
      className="
        grid grid-cols-1 gap-4 mt-4
        max-h-[70vh] overflow-y-auto pr-2       /* rolagem interna      */
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

          {/* Tooltip opcional para descrição -------------------------------- */}
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
