
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { Check, Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshSubscription, plan, isLoading } = useSubscription();
  const [verifying, setVerifying] = useState(true);
  
  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Wait to ensure Stripe has completed all processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Refresh subscription details
        await refreshSubscription();
        
        setVerifying(false);
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setVerifying(false);
      }
    };
    
    verifySubscription();
  }, [refreshSubscription]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-[400px] max-w-full">
        <CardHeader className="text-center">
          {verifying || isLoading ? (
            <>
              <CardTitle className="text-2xl">Verificando Pagamento</CardTitle>
              <CardDescription>Estamos confirmando sua assinatura...</CardDescription>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
              <CardDescription>Sua assinatura foi ativada com sucesso.</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {verifying || isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="py-6 space-y-4">
              <div className="bg-slate-100 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Detalhes da Assinatura:</h3>
                <p><strong>Plano:</strong> {plan?.name || 'Premium'}</p>
                <p><strong>Limite de mensagens:</strong> {plan?.message_limit || 'Ilimitado'}</p>
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                Você já pode aproveitar todos os benefícios do seu plano.
                Um email de confirmação foi enviado para você.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/')}
            disabled={verifying || isLoading}
            className="w-full"
          >
            Ir para o Início
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
