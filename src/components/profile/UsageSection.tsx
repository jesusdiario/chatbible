
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useMessageCount } from "@/hooks/useMessageCount";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const UsageSection = () => {
  const { 
    plan, 
    subscriptionTier, 
    isLoading: subscriptionLoading,
    startCheckout
  } = useSubscription();
  
  const { 
    messageCount, 
    messageLimit, 
    daysUntilReset, 
    percentUsed,
    loading: messageCountLoading 
  } = useMessageCount();

  const isLoading = subscriptionLoading || messageCountLoading;
  const isLowUsage = percentUsed < 70;
  const isMediumUsage = percentUsed >= 70 && percentUsed < 90;
  const isHighUsage = percentUsed >= 90;
  
  const handleUpgradeClick = () => {
    // Use o seu ID de preço real da Stripe aqui
    startCheckout('price_1PhpOSLyyMwTutR9t2Ws2udT');
  };

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
                  <span className={`text-sm ${isHighUsage ? "text-red-500 font-medium" : isMediumUsage ? "text-amber-500" : "text-muted-foreground"}`}>
                    {messageCount} de {messageLimit}
                  </span>
                </div>
                <Progress 
                  value={percentUsed} 
                  className={cn(
                    "h-2",
                    isHighUsage ? "bg-red-100" : isMediumUsage ? "bg-amber-100" : ""
                  )}
                />
                
                {isHighUsage && subscriptionTier === "Gratuito" && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Você está prestes a atingir seu limite mensal!</span>
                  </div>
                )}
                
                {isMediumUsage && subscriptionTier === "Gratuito" && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-amber-500">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Você está se aproximando do seu limite mensal.</span>
                  </div>
                )}
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
              
              {plan?.features && plan.features.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Recursos incluídos:</p>
                  <ul className="space-y-1">
                    {plan.features.map((feature: string, index: number) => (
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
            </>
          )}
        </CardContent>
        
        {!isLoading && subscriptionTier === "Gratuito" && (
          <CardFooter>
            <Button 
              onClick={handleUpgradeClick}
              className="w-full"
            >
              Fazer upgrade para Premium
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default UsageSection;
