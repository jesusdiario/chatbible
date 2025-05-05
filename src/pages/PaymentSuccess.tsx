
import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshSubscription, isLoading } = useSubscription();
  const { toast } = useToast();

  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout;

    const updateSubscription = async () => {
      if (sessionId) {
        // Registra o session_id no console para debug
        console.log('Stripe session ID:', sessionId);
        
        try {
          // Atualiza os dados da assinatura imediatamente
          await refreshSubscription();
          
          // Notifica o usuário
          toast({
            title: "Pagamento processado com sucesso!",
            description: "Sua assinatura Premium foi ativada.",
            variant: "default",
          });
          
          // Redireciona para home após 5 segundos
          redirectTimeout = setTimeout(() => {
            navigate('/');
          }, 5000);
        } catch (error) {
          console.error('Erro ao atualizar assinatura:', error);
          toast({
            title: "Erro ao atualizar sua assinatura",
            description: "Tente atualizar a página ou entre em contato com o suporte.",
            variant: "destructive",
          });
        }
      } else {
        // Sem session_id, redirecionamos mais rapidamente
        redirectTimeout = setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    updateSubscription();
    
    return () => {
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [sessionId, refreshSubscription, navigate, toast]);

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
          {isLoading && (
            <div className="mt-2">
              <div className="animate-spin h-5 w-5 border-2 border-green-500 rounded-full border-t-transparent"></div>
            </div>
          )}
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
