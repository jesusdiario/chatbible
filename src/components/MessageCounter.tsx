
import React from "react";
import { AlertTriangle, Info } from "lucide-react";
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
  const { subscriptionTier, subscribed } = useSubscription();
  
  if (isLoading) return null;
  
  // Calcula a porcentagem do limite utilizado
  const usagePercentage = (currentCount / limit) * 100;
  
  // Define cores com base no uso
  let textColor = "text-gray-500";
  let alertMessage = null;
  let progressBarColor = "bg-blue-500";
  
  // Usuários assinantes não veem o alerta de limite
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
  
  return (
    <div className="w-full text-xs mt-1 text-right">
      {alertMessage && !subscribed && (
        <div className="flex items-center justify-end gap-1 mb-1">
          <AlertTriangle className="h-3 w-3" />
          <span className={textColor}>{alertMessage}</span>
        </div>
      )}
      
      <div className="flex items-center justify-end gap-1">
        <div className={textColor}>
          {currentCount}/{subscribed ? "∞" : limit} mensagens enviadas este mês 
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
              {subscribed ? (
                <p>Com seu plano {subscriptionTier}, você tem mensagens ilimitadas!</p>
              ) : (
                <p>Seu limite de mensagens será renovado em {daysUntilReset} dia{daysUntilReset !== 1 ? 's' : ''}</p>
              )}
              {!subscribed && <p className="mt-1">Faça upgrade para o plano Premium para aumentar seu limite</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Barra de progresso - não mostra para usuários com assinatura ativa */}
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
