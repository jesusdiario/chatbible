
import { useState, useEffect } from "react";
import { X, CreditCard, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal = ({ isOpen, onClose }: SubscriptionModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();
  const { plans, startCheckout } = useSubscription();
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setIsProcessing(false);
      setPassword("");
    }
    
    // If user is logged in, pre-fill the email
    if (user?.email) {
      setEmail(user.email);
      if (user.user_metadata?.full_name) {
        setName(user.user_metadata.full_name);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubscribe = async (priceId: string) => {
    setIsProcessing(true);
    try {
      if (!email) {
        throw new Error('Email é obrigatório');
      }
      
      // If user is not logged in, require a password
      if (!user && !password) {
        throw new Error('Senha é obrigatória para criar sua conta');
      }

      console.log(`Iniciando checkout para o plano com priceId: ${priceId}`);
      await startCheckout(priceId, email, password, name);
      // Não fechamos o modal aqui pois o usuário será redirecionado para o Stripe
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível iniciar o processo de assinatura",
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
        
        {/* Formulário de cadastro para novos usuários */}
        {!user && (
          <div className="mb-6 space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
              <Input 
                id="name"
                type="text" 
                placeholder="Seu nome" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="********" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Esta senha será usada para acessar sua conta após a assinatura.
              </p>
            </div>
          </div>
        )}
        
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
                    <span>Renovação Mensal</span>
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
                      Assinar Agora
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
