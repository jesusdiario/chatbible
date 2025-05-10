
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2, Lock } from 'lucide-react';

const LimitExceeded = () => {
  const { subscriptionStatus, checkSubscriptionStatus } = useAuth();
  const { startCheckout, isProcessing } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Price ID for premium subscription
  const PREMIUM_PRICE_ID = 'price_1RJfFtLyyMwTutR95rlmrvcA';

  useEffect(() => {
    const checkStatus = async () => {
      await checkSubscriptionStatus();
      setIsLoading(false);
    };
    
    checkStatus();
    
    // Check if the user's status has changed every 5 seconds
    const intervalId = setInterval(checkStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, [checkSubscriptionStatus]);

  // If subscription status is loading, show loading indicator
  if (isLoading || subscriptionStatus.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-center">Verificando status da assinatura...</p>
      </div>
    );
  }

  // If user is now subscribed or has not exceeded limit, redirect to home
  if (subscriptionStatus.isSubscribed || !subscriptionStatus.limitExceeded) {
    navigate('/');
    return null;
  }

  const handleUpgrade = async () => {
    try {
      await startCheckout(PREMIUM_PRICE_ID);
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-amber-100 text-amber-600 mb-4">
            <Lock className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Limite de Mensagens Atingido</h1>
          
          <p className="text-muted-foreground mb-6">
            Você atingiu seu limite mensal de mensagens gratuitas. 
            Faça upgrade para o plano Premium para continuar aproveitando 
            todas as funcionalidades com mensagens ilimitadas.
          </p>
          
          <div className="w-full space-y-4">
            <Button 
              onClick={handleUpgrade}
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Fazer Upgrade para Premium'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/auth')} // Logout alternative
            >
              Fazer Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitExceeded;
