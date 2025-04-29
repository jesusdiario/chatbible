
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useMessageCount } from "@/hooks/useMessageCount";
import { useSubscription } from "@/hooks/useSubscription";

const UsageTab = () => {
  const { 
    subscribed, 
    subscriptionTier, 
    messageLimit,
    openCustomerPortal
  } = useSubscription();
  
  const { messageCount, loading: messageCountLoading } = useMessageCount(messageLimit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso de Mensagens</CardTitle>
        <CardDescription>Monitoramento do seu uso</CardDescription>
      </CardHeader>
      <CardContent>
        {messageCountLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Mensagens utilizadas</span>
                <span className="font-medium">{messageCount} de {messageLimit}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-2 rounded-full ${
                    messageCount / messageLimit >= 0.9 ? 'bg-red-500' : 
                    messageCount / messageLimit >= 0.7 ? 'bg-amber-500' : 
                    'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min((messageCount / messageLimit) * 100, 100)}%` }}
                />
              </div>
              
              {messageCount / messageLimit >= 0.7 && (
                <div className={`text-sm ${messageCount / messageLimit >= 0.9 ? 'text-red-500' : 'text-amber-500'} mt-1`}>
                  {messageCount / messageLimit >= 0.9 
                    ? 'Você está prestes a atingir seu limite mensal!' 
                    : 'Você está se aproximando do seu limite mensal.'}
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Plano atual: {subscriptionTier || "Gratuito"}</h4>
              <p className="text-sm text-gray-600 mb-4">
                {subscribed 
                  ? `Seu plano ${subscriptionTier} inclui ${messageLimit} mensagens por mês.` 
                  : `O plano Gratuito inclui ${messageLimit} mensagens por mês.`}
              </p>
              
              {!subscribed && (
                <Button onClick={() => openCustomerPortal()} className="w-full">
                  Fazer upgrade
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageTab;
