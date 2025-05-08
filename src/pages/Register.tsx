
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificação dos termos de uso
      if (!termsAccepted) {
        toast({
          title: "Termos não aceitos",
          description: "Você precisa aceitar os termos para criar uma conta.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Verificação de senha forte
      if (password.length < 6) {
        toast({
          title: "Senha fraca",
          description: "Sua senha deve ter pelo menos 6 caracteres.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Cadastro com Supabase - Definindo um timeout mais curto
      const { error, data } = await Promise.race([
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              terms_accepted: termsAccepted
            }
          }
        }),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error("Tempo de resposta excedido. Tente novamente.")), 8000)
        )
      ]);

      if (error) throw error;

      console.log("Usuário registrado:", data);
      
      // Redirecionar para a primeira etapa do onboarding
      navigate("/onboarding/1");
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Vamos conhecer você melhor."
      });
    } catch (error: any) {
      console.error("Erro no registro:", error);
      
      // Tratamento de erros específicos
      if (error.message === "Tempo de resposta excedido. Tente novamente.") {
        toast({
          title: "Erro no cadastro",
          description: "O servidor está demorando para responder. Por favor, tente novamente em alguns instantes.",
          variant: "destructive"
        });
      } else if (error.message?.includes("already registered")) {
        toast({
          title: "Email já registrado",
          description: "Este email já está sendo utilizado. Tente fazer login ou use outro email.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro no cadastro",
          description: error.message || "Ocorreu um erro durante o cadastro. Tente novamente.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + "/onboarding/1"
        }
      });
      
      if (error) throw error;

      // O redirecionamento será tratado pelo OAuth
    } catch (error: any) {
      toast({
        title: "Erro de autenticação",
        description: error.message || "Ocorreu um erro ao tentar autenticar com Google.",
        variant: "destructive"
      });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ffffff] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-dark">Discipler</h1>
          <p className="text-dark-500 mt-2">Seu Assistente Online de Estudo Bíblico e Discipulado.</p>
        </div>

        <div className="rounded-lg p-6 border border-[##F9F9F9] bg-[#ffffff] shadow-sm">
          <h2 className="text-xl font-semibold text-dark mb-6">
            Crie sua conta gratuita
          </h2>
          
          <Button onClick={handleGoogleSignIn} disabled={googleLoading} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            {googleLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </span>
            ) : (
              "Continuar com Google"
            )}
          </Button>
          
          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
              ou
            </span>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-dark">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="border-slate-600 text-dark bg-[#ffffff]" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-dark">Senha</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="********" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="border-slate-600 text-dark pr-10 bg-[#ffffff]" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && password.length < 6 && (
                <p className="text-xs text-red-500 mt-1">A senha deve ter pelo menos 6 caracteres</p>
              )}
            </div>
            
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={checked => setTermsAccepted(checked === true)} 
              />
              <Label htmlFor="terms" className="text-sm text-dark-300 leading-tight">
                Eu concordo com os <a href="#" className="text-[#4483f4] hover:underline">Termos de Uso</a> e <a href="#" className="text-[#4483f4] hover:underline">Políticas de Privacidade</a>
              </Label>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || !termsAccepted} 
              className="w-full bg-[#4483f4] text-[#ffffff]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </span>
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate("/auth")} 
              className="text-[#4483f4] hover:underline text-sm" 
              type="button"
            >
              Já tem uma conta? Entre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
