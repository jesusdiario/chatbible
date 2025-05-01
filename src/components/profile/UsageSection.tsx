
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useMessageCount } from "@/hooks/useMessageCount";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslation } from "react-i18next";

const UsageSection = () => {
  const { t } = useTranslation();
  const {
    plan,
    subscriptionTier,
    isLoading: subscriptionLoading,
    subscriptionEnd,
    startCheckout,
    refreshSubscription
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

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{t('profile.usage')}</h2>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('profile.usage')}</CardTitle>
            <CardDescription>{t('profile.messagesUsed')}</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh} 
            disabled={isLoading}
            className="h-8"
          >
            {isLoading ? t('profile.processing') : t('common.refresh')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {messageCount} {t('profile.messageLimit')} {messageLimit} {t('chat.messages')}
                </span>
                <div className="flex items-center gap-2">
                  <span 
                    className={cn(
                      "text-xs font-medium",
                      isLowUsage && "text-green-500",
                      isMediumUsage && "text-amber-500",
                      isHighUsage && "text-red-500"
                    )}
                  >
                    {percentUsed}%
                  </span>
                </div>
              </div>

              <Progress 
                value={percentUsed} 
                max={100}
                className={cn(
                  "h-2",
                  isLowUsage && "bg-green-100 [&>div]:bg-green-500",
                  isMediumUsage && "bg-amber-100 [&>div]:bg-amber-500",
                  isHighUsage && "bg-red-100 [&>div]:bg-red-500"
                )}
              />

              {isHighUsage && !subscriptionTier && (
                <div className="flex items-center mt-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                  <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <p>{t('chat.limitReached')}</p>
                </div>
              )}

              <div className="grid gap-1 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('profile.currentPlan')}</span>
                  <span className="font-medium">{subscriptionTier || t('profile.free')}</span>
                </div>
                
                {formattedResetDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('profile.nextReset')}</span>
                    <span>{formattedResetDate}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('profile.daysUntilReset')}</span>
                  <span>{daysUntilReset}</span>
                </div>
              </div>

              {isHighUsage && !subscriptionTier && (
                <Button 
                  className="w-full mt-2" 
                  onClick={handleUpgradeClick} 
                  disabled={isLoading}
                >
                  {t('profile.upgrade')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageSection;
