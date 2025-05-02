
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useMessageCount } from "@/hooks/useMessageCount";
import { AlertTriangle, Info, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const UsageSection = () => {
  const {
    plan,
    subscriptionTier,
    isLoading: subscriptionLoading,
    subscriptionEnd,
    startCheckout,
    refreshSubscription,
    subscribed
  } = useSubscription();
  
  const {
    messageCount,
    messageLimit,
    daysUntilReset,
    percentUsed: rawPercentUsed,
    loading: messageCountLoading,
    refresh
  } = useMessageCount();

  // Safely calculate percentUsed to avoid division by zero
  const percentUsed = messageLimit ? Math.round(messageCount / messageLimit * 100) : 0;
  const isLoading = subscriptionLoading || messageCountLoading;
  const isLowUsage = percentUsed < 70;
  const isMediumUsage = percentUsed >= 70 && percentUsed < 90;
  const isHighUsage = percentUsed >= 90;

  // Ao carregar o componente ou quando os dados de assinatura mudarem,
  // atualizamos os dados de contagem de mensagens para garantir sincronização
  useEffect(() => {
    if (!subscriptionLoading && refresh) {
      refresh();
    }
  }, [subscriptionLoading, refresh]);
  
  useEffect(() => {
    // Refresh subscription data when component mounts
    refreshSubscription && refreshSubscription();
  }, [refreshSubscription]);
  
  const handleUpgradeClick = () => {
    // Use o ID do produto real criado na Stripe
    if (plan?.stripe_price_id) {
      startCheckout(plan.stripe_price_id);
    } else {
      startCheckout('price_1RJfFtLyyMwTutR95rlmrvcA'); // Fallback ID
    }
  };

  // Format the reset date as "29 de abril de 2026"
  const formattedResetDate = subscriptionEnd ? format(new Date(subscriptionEnd), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  }) : null;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uso de Mensagens</CardTitle>
          <CardDescription>Carregando informações de uso...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uso de Mensagens</CardTitle>
        <CardDescription>
          {subscribed 
            ? "Você tem mensagens ilimitadas com seu plano Premium" 
            : "Seu uso mensal de mensagens"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">Mensagens Utilizadas</p>
              <div className="text-2xl font-bold flex items-center">
                {messageCount} 
                <span className="mx-1 text-gray-400">/</span>
                {subscribed ? (
                  <span className="inline-flex items-center text-green-600">
                    <Infinity className="h-5 w-5 mr-1" />
                    <span>Ilimitado</span>
                  </span>
                ) : (
                  <span>{messageLimit}</span>
                )}
              </div>
            </div>
            
            {subscriptionTier && (
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                Plano {subscriptionTier}
              </div>
            )}
          </div>

          {!subscribed && (
            <>
              <Progress
                value={Math.min(percentUsed, 100)}
                className={cn(
                  "h-2",
                  isHighUsage && "text-red-500",
                  isMediumUsage && "text-amber-500",
                  isLowUsage && "text-blue-500"
                )}
              />
              
              {isHighUsage && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Você está prestes a atingir seu limite mensal!</span>
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            <span>
              {subscribed 
                ? "Seu plano Premium permite uso ilimitado de mensagens" 
                : `O contador será renovado em ${daysUntilReset} dia${daysUntilReset !== 1 ? 's' : ''}`}
            </span>
          </div>
          
          {formattedResetDate && subscribed && (
            <div className="text-sm text-gray-500">
              Sua assinatura Premium renova em {formattedResetDate}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {!subscribed && (
          <Button onClick={handleUpgradeClick} className="w-full">
            Upgrade para Premium
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UsageSection;
