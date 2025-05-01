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
const UsageSection = () => {
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
  return;
};
export default UsageSection;