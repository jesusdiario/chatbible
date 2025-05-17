
import React, { useState } from "react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import SubscriptionModal from "@/components/SubscriptionModal";
import { Infinity, CreditCard } from "lucide-react";

const SubscriptionSection = () => {
  const { 
    subscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    plan, 
    isLoading,
    openCustomerPortal, 
    refreshSubscription
  } = useSubscription();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  const handleManageSubscription = async () => {
    try {
      setIsProcessing(true);
      if (subscribed) {
        // Se já tem assinatura, abrir o portal do cliente
        await openCustomerPortal();
      } else {
        // Se não tem assinatura, mostrar modal de planos
        setShowSubscriptionModal(true);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Erro ao gerenciar assinatura:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Assinatura</h2>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Detalhes da Assinatura</CardTitle>
            <CardDescription>Informações sobre seu plano atual</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSubscription}
            disabled={isLoading}
            className="h-8"
          >
            Atualizar
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Status:</p>
                {subscribed ? (
                  <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
                ) : (
                  <Badge variant="destructive">Inativo</Badge>
                )}
              </div>

              {subscribed ? (
                <>
                  <div className="grid gap-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Plano</span>
                      <span className="text-sm font-medium">{subscriptionTier}</span>
                    </div>
                    
                    {plan && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Valor</span>
                        <span className="text-sm font-medium">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: plan.price_currency || 'BRL' 
                          }).format(plan.price_amount / 100)}
                          {subscriptionTier?.includes('Anual') ? '/ano' : '/mês'}
                        </span>
                      </div>
                    )}
                    
                    {subscriptionEnd && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Próxima cobrança</span>
                        <span className="text-sm font-medium">
                          {format(new Date(subscriptionEnd), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}
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
              ) : (
                <div className="py-4 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Você não possui uma assinatura ativa. Assine agora para acessar todas as funcionalidades!
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleManageSubscription}
            disabled={isProcessing}
            className="w-full mt-4"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : subscribed ? (
              <>
                <CreditCard className="mr-2" />
                Gerenciar assinatura
              </>
            ) : (
              <>
                <CreditCard className="mr-2" />
                Ver planos disponíveis
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  );
};

export default SubscriptionSection;
