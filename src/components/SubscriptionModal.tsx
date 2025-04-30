
import { useState, useEffect } from "react";
import { X, CreditCard, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { formatCurrency } from "@/lib/formatters";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { plans, getStripePriceId, subscriptionTier } = useSubscription();

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribe = async (planId: string) => {
    setIsProcessing(true);
    
    // Get Stripe price ID for the plan
    const stripePriceId = getStripePriceId(planId);
    
    if (!stripePriceId) {
      toast({
        title: "Erro",
        description: "ID do preço Stripe não encontrado para este plano",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }
    
    try {
      const { startCheckout } = useSubscription();
      await startCheckout(stripePriceId);
      // User will be redirected to Stripe
    } catch (error) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o checkout",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Filter out free plan from modal
  const paidPlans = plans.filter(plan => plan.price_cents > 0);
  const currentPlanCode = subscriptionTier || 'FREE';

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
          <h2 className="text-2xl font-semibold mb-2">Upgrade para BibleChat Pro</h2>
          <p className="text-slate-400">Libere todo o potencial do BibleChat</p>
        </div>
        
        {plans.length > 0 ? (
          <div className="space-y-6">
            {paidPlans.map((plan) => (
              <div 
                key={plan.id} 
                className={`mb-6 rounded-lg border p-6 ${
                  currentPlanCode === plan.code ? 'border-green-500 bg-green-50' : 'border-slate-700'
                }`}
              >
                {currentPlanCode === plan.code && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Plano Atual
                  </div>
                )}
                
                <div className="mb-4 flex items-baseline justify-center">
                  <span className="text-3xl font-bold">
                    {formatCurrency(plan.price_cents / 100, plan.currency)}
                  </span>
                  <span className="ml-1 text-slate-400">/{plan.period}</span>
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
                    <span>Até {plan.message_limit} mensagens por mês</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="mr-2 h-5 w-5 text-green-500 shrink-0" />
                    <span>Renovação automática mensal</span>
                  </li>
                </ul>
                
                {currentPlanCode !== plan.code ? (
                  <Button 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => handleSubscribe(plan.id)}
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
                ) : (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={onClose}
                  >
                    Plano Atual
                  </Button>
                )}
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
