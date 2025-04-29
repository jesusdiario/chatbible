
import React from "react";
import { AlertTriangle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface MessageCounterProps {
  currentCount: number;
  limit: number;
  isLoading: boolean;
}

const MessageCounter = ({ currentCount, limit, isLoading }: MessageCounterProps) => {
  const { subscriptionTier, subscribed } = useSubscription();
  
  if (isLoading) return null;
  
  // Calcula a porcentagem do limite utilizado
  const usagePercentage = (currentCount / limit) * 100;
  
  // Define cores com base no uso
  let textColor = "text-gray-500";
  let alertMessage = null;
  
  if (usagePercentage >= 90) {
    textColor = "text-red-500 font-medium";
    alertMessage = "Você está prestes a atingir seu limite mensal!";
  } else if (usagePercentage >= 70) {
    textColor = "text-amber-500";
    alertMessage = "Você está se aproximando do seu limite mensal.";
  }
  
  return (
    <div className="w-full text-xs mt-1 text-right">
      {alertMessage && !subscribed && (
        <div className="flex items-center justify-end gap-1 mb-1">
          <AlertTriangle className="h-3 w-3" />
          <span className={textColor}>{alertMessage}</span>
        </div>
      )}
      <div className={textColor}>
        {currentCount}/{limit} mensagens enviadas este mês 
        {subscriptionTier && ` (Plano ${subscriptionTier})`}
      </div>
      {/* Barra de progresso */}
      <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
        <div 
          className={`h-1 rounded-full ${
            usagePercentage >= 90 ? 'bg-red-500' : 
            usagePercentage >= 70 ? 'bg-amber-500' : 
            'bg-blue-500'
          }`}
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default MessageCounter;
