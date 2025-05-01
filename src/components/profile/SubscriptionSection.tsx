
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useMessageCount } from "@/hooks/useMessageCount";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const SubscriptionSection = () => {
  const { t } = useTranslation();
  const { 
    subscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    plan, 
    isLoading,
    openCustomerPortal, 
    refreshSubscription,
    startCheckout
  } = useSubscription();
  
  const {
    messageCount,
    messageLimit,
    percentUsed: rawPercentUsed,
    daysUntilReset,
    loading: messageCountLoading,
    refresh: refreshMessageCount
  } = useMessageCount();
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Safely calculate percentUsed to avoid division by zero
  const percentUsed = messageLimit ? Math.round(messageCount / messageLimit * 100) : 0;
  const isLowUsage = percentUsed < 70;
  const isMediumUsage = percentUsed >= 70 && percentUsed < 90;
  const isHighUsage = percentUsed >= 90;
  
  // Sincronizar dados de contagem e assinatura
  useEffect(() => {
    if (!isLoading && !messageCountLoading) {
      refreshMessageCount && refreshMessageCount();
    }
  }, [isLoading, subscriptionTier, refreshMessageCount, messageCountLoading]);
  
  const handleManageSubscription = async () => {
    try {
      setIsProcessing(true);
      if (subscribed) {
        // Se já tem assinatura, abrir o portal do cliente
        await openCustomerPortal();
      } else {
        // Se não tem assinatura, iniciar checkout
        // Use o ID do produto real criado na Stripe
        await startCheckout('price_1RJfFtLyyMwTutR95rlmrvcA');
      }
    } catch (error) {
      console.error('Erro ao gerenciar assinatura:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format the reset date as "29 de abril de 2026"
  const formattedResetDate = subscriptionEnd ? format(new Date(subscriptionEnd), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  }) : null;

  const isFullLoading = isLoading || messageCountLoading;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{t('profile.subscription')}</h2>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('profile.subscription')}</CardTitle>
            <CardDescription>{t('profile.currentPlan')}: {subscriptionTier || t('profile.free')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refreshSubscription && refreshSubscription();
                refreshMessageCount && refreshMessageCount();
              }}
              disabled={isFullLoading}
              className="h-8"
            >
              {t('common.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isFullLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{t('profile.messagesUsed')}</p>
                    <p className="text-2xl font-bold">
                      {messageCount} <span className="text-sm text-muted-foreground">{t('profile.messageLimit')} {messageLimit}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        isLowUsage && "bg-green-500 hover:bg-green-600",
                        isMediumUsage && "bg-amber-500 hover:bg-amber-600",
                        isHighUsage && "bg-red-500 hover:bg-red-600"
                      )}
                    >
                      {percentUsed}%
                    </Badge>
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

                {isHighUsage && !subscribed && (
                  <div className="flex items-center p-2 bg-red-50 text-red-700 rounded-md text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                    <p>{t('chat.upgradeMessage')}</p>
                  </div>
                )}
              </div>

              <div className="grid gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('profile.status')}</span>
                  {subscribed ? (
                    <Badge className="bg-green-500 hover:bg-green-600">{t('common.active')}</Badge>
                  ) : (
                    <Badge variant="secondary">{t('profile.free')}</Badge>
                  )}
                </div>
                
                {subscribed && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('profile.plan')}</span>
                      <span className="text-sm font-medium">{subscriptionTier}</span>
                    </div>
                    
                    {plan && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('profile.price')}</span>
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: plan.price_currency || 'BRL' 
                          }).format(plan.price_amount / 100)}
                          /mês
                        </span>
                      </div>
                    )}
                    
                    {subscriptionEnd && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('profile.nextRenewal')}</span>
                        <span className="text-sm font-medium">
                          {formattedResetDate}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t('profile.daysUntilReset')}</span>
                  <span className="text-sm font-medium">{daysUntilReset}</span>
                </div>
              </div>
                  
              {plan?.features && plan.features.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">{t('profile.includedFeatures')}:</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center">
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="mr-2 text-green-500"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button 
                onClick={handleManageSubscription}
                disabled={isProcessing || isFullLoading}
                className="w-full mt-4"
              >
                {isProcessing ? t('profile.processing') : subscribed ? t('profile.manageSubscription') : t('profile.upgrade')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSection;
