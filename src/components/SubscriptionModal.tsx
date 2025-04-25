
import { useState } from "react";
import { X, CreditCard, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubscribe = () => {
    setIsProcessing(true);
    
    // Simulação de processamento - em produção conectaria ao Stripe
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: "Processando assinatura",
        description: "Em um ambiente de produção, você seria redirecionado para o Stripe para completar sua assinatura.",
      });
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold mb-2">Upgrade para BibleGPT Pro</h2>
          <p className="text-slate-400">Libere todo o potencial do BibleGPT</p>
        </div>
        
        <div className="mb-6 rounded-lg border border-slate-700 p-6">
          <div className="mb-4 flex items-baseline justify-center">
            <span className="text-3xl font-bold">R$29</span>
            <span className="ml-1 text-slate-400">/mês</span>
          </div>
          
          <ul className="mb-6 space-y-3">
            <li className="flex items-start">
              <Check className="mr-2 h-5 w-5 text-green-500 shrink-0" />
              <span>Até 200 mensagens por mês</span>
            </li>
            <li className="flex items-start">
              <Check className="mr-2 h-5 w-5 text-green-500 shrink-0" />
              <span>Acesso ao Construtor de Estudo</span>
            </li>
            <li className="flex items-start">
              <Check className="mr-2 h-5 w-5 text-green-500 shrink-0" />
              <span>Acesso ao Construtor de Pregação</span>
            </li>
            <li className="flex items-start">
              <Check className="mr-2 h-5 w-5 text-green-500 shrink-0" />
              <span>Renovação automática mensal</span>
            </li>
          </ul>
          
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleSubscribe}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>Processando...</>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Assinar agora
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-center text-slate-500">
          A assinatura será renovada automaticamente. Você pode cancelar a qualquer momento. 
          Pagamento processado com segurança via Stripe.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;
