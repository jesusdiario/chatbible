
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Google } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        navigate("/");
      } else {
        // Cadastro
        if (!termsAccepted) {
          toast({
            title: "Termos não aceitos",
            description: "Você precisa aceitar os termos para criar uma conta.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              terms_accepted: termsAccepted
            }
          }
        });
        if (error) throw error;
        toast({
          title: "Conta criada com sucesso!",
          description: "Você já pode fazer login com suas credenciais."
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro durante a autenticação.",
        variant: "destructive"
      });
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
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // No need to navigate here as the OAuth redirect will handle this
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ffffff]-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="https://jesusdiario.com.br/wp-content/uploads/2024/11/logo-jd.png" alt="Logo" className="w-[80px] h-[80px]" />
          </div>
          <h1 className="text-3xl font-bold text-dark">BibleChat</h1>
          <p className="text-dark-500 mt-2">Seu Assistente do Jesus Diário de Estudo Bíblico.</p>
        </div>

        <div className="rounded-lg p-6 border border-[##F9F9F9] bg-[#ffffff]">
          <h2 className="text-xl font-semibold text-dark mb-6">
            {isLogin ? "Entre na sua conta" : "Crie sua conta gratuita"}
          </h2>
          
          <Button 
            onClick={handleGoogleSignIn} 
            disabled={googleLoading} 
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 mb-6"
          >
            <Google size={18} />
            {googleLoading ? "Processando..." : "Continuar com Google"}
          </Button>
          
          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
              ou
            </span>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-dark">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="border-slate-600 text-dark bg-[#ffffff]-950" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-dark">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="********" value={password} onChange={e => setPassword(e.target.value)} required className="border-slate-600 text-dark pr-10 bg-[#ffffff]-950" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {!isLogin && <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={checked => setTermsAccepted(checked === true)} />
                <Label htmlFor="terms" className="text-sm text-dark-300 leading-tight">
                  Eu concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e <a href="#" className="[#4483f4] hover:underline">Políticas de Privacidade</a>
                </Label>
              </div>}
            
            <Button type="submit" disabled={loading || !isLogin && !termsAccepted} className="w-full bg-[#4483f4] text-[#ffffff]">
              {loading ? "Processando..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#4483f4] hover:underline text-sm" type="button">
              {isLogin ? "Não tem uma conta? Crie agora" : "Já tem uma conta? Entre"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
