
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription data when this page loads
    refreshSubscription();
    
    // Redirect to home after 5 seconds
    const timeout = setTimeout(() => {
      navigate('/');
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [refreshSubscription, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <CardTitle className="text-2xl">Pagamento confirmado!</CardTitle>
          <CardDescription>Obrigado por assinar o BibleGPT Pro</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <p className="text-center text-muted-foreground">
            Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos premium da plataforma.
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <p>Você será redirecionado automaticamente</p>
            <div className="h-1 w-full max-w-xs bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-progress"></div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button asChild>
            <Link to="/">Ir para página inicial</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
