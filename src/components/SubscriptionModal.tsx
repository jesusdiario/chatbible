
import { useState, useEffect } from "react";
import { X, CreditCard, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { plans, startCheckout } = useSubscription();

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribe = async (priceId: string) => {
    setIsProcessing(true);
    try {
      console.log(`Iniciando checkout para o plano com priceId: ${priceId}`);
      // Use o ID do produto real criado na Stripe
      await startCheckout('price_1RJfFtLyyMwTutR95rlmrvcA');
      // Não vamos fechar o modal aqui pois o usuário será redirecionado para o Stripe
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo de assinatura",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-slate-800"
          disabled={isProcessing}
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Upgrade Discipler Pro</h2>
          <p className="text-slate-400">Usufrua Sem Limites!</p>
        </div>
        
        {plans.length > 0 ? (
          <div className="space-y-6">
            {plans.filter(plan => plan.stripe_price_id !== 'free_plan').map((plan) => (
              <div key={plan.id} className="mb-6 rounded-lg border border-slate-700 p-6">
                <div className="mb-4 flex items-baseline justify-center">
                  <span className="text-3xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: plan.price_currency 
                    }).format(plan.price_amount / 100)}
                  </span>
                  <span className="ml-1 text-slate-400">/mês</span>
                </div>
                
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-5 w-5 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500 shrink-0" />
                    <span>Renovação mensal</span>
                  </li>
                </ul>
                
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleSubscribe(plan.stripe_price_id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Assinar agora
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        
        <p className="text-xs text-center text-accent">
          A assinatura será renovada automaticamente. Você pode cancelar a qualquer momento. 
          Pagamento processado com segurança via Stripe.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;
