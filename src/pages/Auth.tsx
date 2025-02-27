
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast({
        title: 'Termos de uso',
        description: 'Você precisa aceitar os termos de uso para criar uma conta.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            terms_accepted: termsAccepted,
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você já pode fazer login com suas credenciais.',
      });
      
    } catch (error: any) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-chatgpt-main">
      <div className="w-full max-w-md p-8 bg-chatgpt-sidebar rounded-lg shadow-lg border border-chatgpt-border/30">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">BibleGPT</h1>
          <p className="text-gray-400">Sua assistente de estudos bíblicos</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-chatgpt-hover">
            <TabsTrigger value="login" className="data-[state=active]:bg-chatgpt-border/40">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-chatgpt-border/40">Criar Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login" className="text-gray-300">Email</Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-chatgpt-hover border-chatgpt-border text-white placeholder:text-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-login" className="text-gray-300">Senha</Label>
                <Input
                  id="password-login"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-chatgpt-hover border-chatgpt-border text-white placeholder:text-gray-500"
                />
              </div>
              
              <Button type="submit" className="w-full bg-chatgpt-border hover:bg-chatgpt-border/80" disabled={loading}>
                {loading ? 'Processando...' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup" className="text-gray-300">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-chatgpt-hover border-chatgpt-border text-white placeholder:text-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password-signup" className="text-gray-300">Senha</Label>
                <Input
                  id="password-signup"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-chatgpt-hover border-chatgpt-border text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-500">A senha deve ter pelo menos 6 caracteres</p>
              </div>
              
              <div className="flex items-start space-x-2 mt-4">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="border-chatgpt-border data-[state=checked]:bg-chatgpt-border data-[state=checked]:text-white"
                />
                <Label htmlFor="terms" className="text-sm text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Eu concordo com os <a href="#" className="text-blue-400 hover:underline">Termos de Uso</a> e <a href="#" className="text-blue-400 hover:underline">Políticas de Privacidade</a>
                </Label>
              </div>
              
              <Button type="submit" className="w-full bg-chatgpt-border hover:bg-chatgpt-border/80" disabled={loading}>
                {loading ? 'Processando...' : 'Criar Conta Gratuita'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
