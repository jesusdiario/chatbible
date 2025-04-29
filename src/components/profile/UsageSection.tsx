
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSubscription } from "@/hooks/useSubscription";
import { useMessageCount } from "@/hooks/useMessageCount";

const UsageSection = () => {
  const { 
    plan, 
    subscriptionTier, 
    isLoading: subscriptionLoading 
  } = useSubscription();
  const { 
    messageCount, 
    MESSAGE_LIMIT, 
    daysUntilReset, 
    loading: messageCountLoading 
  } = useMessageCount(plan?.message_limit);

  const isLoading = subscriptionLoading || messageCountLoading;
  const messageLimit = plan?.message_limit || MESSAGE_LIMIT;
  const percentUsed = Math.min(Math.round((messageCount / messageLimit) * 100), 100);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Uso</h2>
      <Card>
        <CardHeader>
          <CardTitle>Utilização</CardTitle>
          <CardDescription>
            Seu histórico de uso da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Mensagens</span>
                  <span className="text-sm text-muted-foreground">
                    {messageCount} de {messageLimit}
                  </span>
                </div>
                <Progress value={percentUsed} className="h-2" />
              </div>
              
              <div className="grid gap-1">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Plano</span>
                  <span className="text-sm font-medium">
                    {subscriptionTier || "Gratuito"}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Limite de mensagens</span>
                  <span className="text-sm font-medium">{messageLimit} por mês</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Reset em</span>
                  <span className="text-sm font-medium">
                    {daysUntilReset} dia{daysUntilReset !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageSection;
