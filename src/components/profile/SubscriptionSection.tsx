
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSubscriptionActions } from "@/hooks/subscription/useSubscriptionActions";

const SubscriptionSection = () => {
  const { openCustomerPortal } = useSubscriptionActions();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleManageSubscription = async () => {
    try {
      setIsProcessing(true);
      await openCustomerPortal();
    } catch (error) {
      console.error('Erro ao abrir portal do cliente:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Assinatura</h2>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Assinatura</CardTitle>
          <CardDescription>Informações sobre seu plano atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm text-muted-foreground">Plano Gratuito</p>
          </div>
          
          <Button 
            onClick={handleManageSubscription}
            disabled={isProcessing}
          >
            {isProcessing ? "Processando..." : "Gerenciar assinatura"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSection;
