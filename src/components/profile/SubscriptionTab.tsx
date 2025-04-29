
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  CalendarIcon, 
  RefreshCw, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  MessageCircle,
  Users,
  Sparkles
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

const SubscriptionTab = () => {
  const { toast } = useToast();
  const [isRefreshingSubscription, setIsRefreshingSubscription] = useState(false);
  
  const { 
    isLoading: subscriptionLoading,
    subscribed, 
    subscriptionTier, 
    subscriptionEnd,
    messageLimit,
    refreshSubscription,
    openCustomerPortal,
    plans
  } = useSubscription();

  const handleRefreshSubscription = async () => {
    setIsRefreshingSubscription(true);
    await refreshSubscription();
    setIsRefreshingSubscription(false);
    toast({
      title: "Assinatura atualizada",
      description: "Informações de assinatura atualizadas com sucesso."
    });
  };
  
  const handleManageSubscription = async () => {
    await openCustomerPortal();
  };

  const getSubscriptionBadge = () => {
    if (subscribed) {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Ativo</span>;
    }
    return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Gratuito</span>;
  };

  const getPlanBenefits = (planName: string | null) => {
    switch (planName) {
      case "Pro":
        return [
          { icon: <MessageCircle className="h-4 w-4" />, text: `${messageLimit} mensagens por mês` },
          { icon: <Shield className="h-4 w-4" />, text: "Acesso a todos os livros da Bíblia" },
          { icon: <Users className="h-4 w-4" />, text: "Uso para grupos e ministérios" },
          { icon: <Sparkles className="h-4 w-4" />, text: "Geração de conteúdo avançado" }
        ];
      default:
        return [
          { icon: <MessageCircle className="h-4 w-4" />, text: `${messageLimit} mensagens por mês` },
          { icon: <Shield className="h-4 w-4" />, text: "Acesso básico aos livros bíblicos" }
        ];
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Minha Assinatura</CardTitle>
            {getSubscriptionBadge()}
          </div>
          <CardDescription>Gerencie seu plano</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleRefreshSubscription}
          disabled={isRefreshingSubscription}
          title="Atualizar informações"
        >
          {isRefreshingSubscription ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      
      <CardContent>
        {subscriptionLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Plano atual */}
              <div className="flex-1 border rounded-lg p-6 relative">
                {subscribed && (
                  <div className="absolute -right-2 -top-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                    Ativo
                  </div>
                )}
                <h3 className="font-bold text-xl mb-2">{subscriptionTier || "Gratuito"}</h3>
                
                {subscribed ? (
                  <>
                    <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                      <CheckCircle className="h-4 w-4" />
                      <span>Assinatura ativa</span>
                    </div>
                    {subscriptionEnd && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Renovação em {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <span>Plano básico</span>
                  </div>
                )}
                
                <ul className="space-y-2 mb-6">
                  {getPlanBenefits(subscriptionTier).map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{benefit.text}</span>
                    </li>
                  ))}
                </ul>
                
                {subscribed ? (
                  <Button onClick={handleManageSubscription} className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Gerenciar assinatura
                  </Button>
                ) : (
                  <Button onClick={() => openCustomerPortal()} className="w-full">
                    Fazer upgrade
                  </Button>
                )}
              </div>
            </div>
            
            {/* Histórico de pagamentos - placeholder */}
            {subscribed && (
              <div className="mt-8">
                <h3 className="font-medium text-lg mb-3">Histórico de pagamentos</h3>
                <div className="border rounded-lg p-4">
                  <div className="text-center py-6 text-gray-500">
                    As informações de pagamento estão disponíveis no Portal do Cliente.
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" onClick={handleManageSubscription}>
                      Ver histórico no Portal do Cliente
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionTab;
