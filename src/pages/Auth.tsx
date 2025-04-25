import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // Login
        const {
          error
        } = await supabase.auth.signInWithPassword({
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
        const {
          error
        } = await supabase.auth.signUp({
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
  return <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src="/lovable-uploads/logo jd bible chat.png" alt="Logo" className="w-[50px] h-[50px]" />
          </div>
          <h1 className="text-3xl font-bold text-dark">BibleGPT</h1>
          <p className="text-gray-400 mt-2">Seu Assistente do Jesus Diário de Estudo Bíblico.</p>
        </div>

        <div className="rounded-lg shadow-xl p-6 border border-slate-700 bg-black">
          <h2 className="text-xl font-semibold text-dark mb-6">
            {isLogin ? "Entre na sua conta" : "Crie sua conta gratuita"}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-dark">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="border-slate-600 text-dark bg-[#ffffff]-950" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Senha</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="********" value={password} onChange={e => setPassword(e.target.value)} required className="border-slate-600 text-white pr-10 bg-zinc-950" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {!isLogin && <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" checked={termsAccepted} onCheckedChange={checked => setTermsAccepted(checked === true)} />
                <Label htmlFor="terms" className="text-sm text-gray-300 leading-tight">
                  Eu concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e <a href="#" className="text-primary hover:underline">Políticas de Privacidade</a>
                </Label>
              </div>}
            
            <Button type="submit" disabled={loading || !isLogin && !termsAccepted} className="w-full bg-[#4483f4] text-indigo-800">
              {loading ? "Processando..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline text-sm" type="button">
              {isLogin ? "Não tem uma conta? Crie agora" : "Já tem uma conta? Entre"}
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default Auth;