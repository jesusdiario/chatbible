
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "./LoadingSpinner";

const SubscriptionCheck = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsChecking(false);
        return;
      }

      try {
        // Verificar assinatura no Supabase
        const { data: subscriptionData, error } = await supabase
          .from("subscribers")
          .select("subscribed, subscription_end")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Erro ao verificar assinatura:", error);
          throw error;
        }

        // Verificar se a assinatura está ativa e dentro da validade
        const hasActiveSubscription = subscriptionData?.subscribed || false;
        const subscriptionEnd = subscriptionData?.subscription_end 
          ? new Date(subscriptionData.subscription_end) 
          : null;
        const isValid = hasActiveSubscription && subscriptionEnd 
          ? new Date() < subscriptionEnd
          : false;

        setHasValidSubscription(isValid);

        // Se não tem assinatura válida, redirecionar para checkout
        if (!isValid) {
          // Mostrar mensagem informativa
          toast({
            title: "Assinatura necessária",
            description: "Por favor, assine para continuar usando o Discipler",
          });
          
          // Redirecionar para checkout
          const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
            body: { 
              priceId: 'price_1RJfFtLyyMwTutR95rlmrvcA',
              successUrl: `${window.location.origin}/payment-success`,
              cancelUrl: `${window.location.origin}/auth`
            }
          });

          if (checkoutError) {
            console.error("Erro ao criar checkout:", checkoutError);
            throw checkoutError;
          }

          // Redirecionar para o checkout do Stripe
          window.location.href = checkoutData.url;
        }
      } catch (error) {
        console.error("Erro ao verificar assinatura:", error);
        toast({
          title: "Erro",
          description: "Não foi possível verificar sua assinatura. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkSubscription();
  }, [user, navigate, toast]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasValidSubscription && user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirecionando para o checkout...</h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionCheck;
