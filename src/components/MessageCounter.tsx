
import React from "react";
import { AlertTriangle, Info, Infinity } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageCounterProps {
  currentCount: number;
  limit: number;
  isLoading: boolean;
  daysUntilReset: number;
}

const MessageCounter = ({ currentCount, limit, isLoading, daysUntilReset }: MessageCounterProps) => {
  const { subscriptionTier, subscribed, startCheckout } = useSubscription();
  
  if (isLoading) return null;
  
  // Calcula a porcentagem do limite utilizado
  const usagePercentage = (currentCount / limit) * 100;
  
  // Define cores com base no uso
  let textColor = "text-gray-500";
  let alertMessage = null;
  let progressBarColor = "bg-blue-500";
  
  // Apenas define mensagens de alerta para usuários não assinantes
  if (!subscribed) {
    if (usagePercentage >= 90) {
      textColor = "text-red-500 font-medium";
      alertMessage = "Você está prestes a atingir seu limite mensal!";
      progressBarColor = "bg-red-500";
    } else if (usagePercentage >= 70) {
      textColor = "text-amber-500";
      alertMessage = "Você está se aproximando do seu limite mensal.";
      progressBarColor = "bg-amber-500";
    }
  }

  const handleUpgradeClick = () => {
    // Use o ID do produto real criado na Stripe
    startCheckout('price_1RJfFtLyyMwTutR95rlmrvcA');
  };
  
  return (
    <div className="w-full text-xs mt-1 text-right">
      {/* Mostra alerta apenas para usuários não assinantes que estão se aproximando do limite */}
      {alertMessage && !subscribed && (
        <div className="flex items-center justify-end gap-1 mb-1">
          <AlertTriangle className="h-3 w-3" />
          <span className={textColor}>{alertMessage}</span>
        </div>
      )}
      
      <div className="flex items-center justify-end gap-1">
        <div className={subscribed ? "text-green-600 font-medium" : textColor}>
          {currentCount}/
          {subscribed ? (
            <span className="inline-flex items-center">
              <Infinity className="h-3 w-3 mx-0.5" />
            </span>
          ) : limit}
          {' '}mensagens enviadas este mês 
          {subscriptionTier && ` (Plano ${subscriptionTier})`}
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Info className="h-3 w-3 text-gray-400 cursor-help" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Seu limite de mensagens será renovado em {daysUntilReset} dia{daysUntilReset !== 1 ? 's' : ''}</p>
              {!subscribed && (
                <>
                  <p className="mt-1">Faça upgrade para o plano Premium para mensagens ilimitadas</p>
                  <button 
                    onClick={handleUpgradeClick}
                    className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium py-1 px-2 rounded transition-colors"
                  >
                    Fazer upgrade agora
                  </button>
                </>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Barra de progresso (apenas para usuários não assinantes) */}
      {!subscribed && (
        <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
          <div 
            className={`h-1 rounded-full ${progressBarColor} transition-all duration-300 ease-in-out`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default MessageCounter;
