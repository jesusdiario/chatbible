
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshSubscription, isLoading } = useSubscription();
  const { toast } = useToast();
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    console.log('[PaymentSuccess] Page loaded with session ID:', sessionId);
    let redirectTimeout: NodeJS.Timeout;
    let retryTimeout: NodeJS.Timeout;

    const checkPaymentStatus = async () => {
      if (sessionId) {
        try {
          console.log('[PaymentSuccess] Verifying payment status, attempt:', verificationAttempts + 1);
          
          // Verify session through the API
          const { data, error } = await supabase.functions.invoke('check-payment-status', {
            body: { sessionId }
          });
          
          if (error) {
            console.error('[PaymentSuccess] Payment verification error:', error);
            throw error;
          }
          
          console.log('[PaymentSuccess] Payment check response:', data);
          
          if (data.status === 'complete') {
            setVerificationStatus('success');
            
            // Try to auto-login if this is a new user
            if (data.email && data.password) {
              try {
                console.log('[PaymentSuccess] Attempting auto-login with new account');
                await supabase.auth.signInWithPassword({
                  email: data.email,
                  password: data.password
                });
                console.log('[PaymentSuccess] Auto-login successful');
              } catch (loginError) {
                console.error('[PaymentSuccess] Auto-login failed:', loginError);
              }
            }
            
            // Update subscription data
            await refreshSubscription();
            
            // Notify user
            toast({
              title: "Pagamento processado com sucesso!",
              description: "Sua assinatura Premium foi ativada.",
              variant: "default",
            });
            
            // Redirect to home after success
            redirectTimeout = setTimeout(() => {
              console.log('[PaymentSuccess] Redirecting to home after successful payment');
              navigate('/');
            }, 3000);
          } else {
            console.log('[PaymentSuccess] Payment status not complete yet:', data.status);
            
            // Retry if not too many attempts
            if (verificationAttempts < 5) {
              setVerificationAttempts(prev => prev + 1);
              retryTimeout = setTimeout(checkPaymentStatus, 3000);
            } else {
              setVerificationStatus('error');
              toast({
                title: "Aviso",
                description: "Estamos processando seu pagamento. Se o acesso não for liberado em alguns instantes, entre em contato com o suporte.",
                variant: "default",
              });
              
              // Redirect anyway after giving up
              redirectTimeout = setTimeout(() => {
                navigate('/');
              }, 5000);
            }
          }
        } catch (error) {
          console.error('[PaymentSuccess] Payment verification error:', error);
          setVerificationStatus('error');
          
          toast({
            title: "Aviso",
            description: "Estamos processando seu pagamento. Se o acesso não for liberado em alguns instantes, entre em contato com o suporte.",
            variant: "default",
          });
          
          // Redirect anyway after error
          redirectTimeout = setTimeout(() => {
            navigate('/');
          }, 5000);
        }
      } else {
        console.log('[PaymentSuccess] No session ID provided');
        // No session_id, redirect quickly
        redirectTimeout = setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    checkPaymentStatus();
    
    return () => {
      if (redirectTimeout) clearTimeout(redirectTimeout);
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [sessionId, refreshSubscription, navigate, toast, verificationAttempts]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2 pb-2">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <CardTitle className="text-2xl">Pagamento confirmado!</CardTitle>
          <CardDescription>Obrigado por assinar o Discipler Pro</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <p className="text-center text-muted-foreground">
            {verificationStatus === 'success' 
              ? "Sua assinatura foi ativada com sucesso. Agora você tem acesso a todos os recursos premium da plataforma."
              : verificationStatus === 'error'
                ? "Estamos processando seu pagamento. O acesso será liberado em breve."
                : "Estamos verificando seu pagamento e ativando sua assinatura..."}
          </p>
          <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <p>Você será redirecionado automaticamente</p>
            <div className="h-1 w-full max-w-xs bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-progress"></div>
            </div>
          </div>
          {(isLoading || verificationStatus === 'pending') && (
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
