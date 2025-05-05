
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import { ArrowRight, ArrowLeft, CalendarDays, Church, Briefcase, Flag, Target, ToggleRight, ToggleLeft } from "lucide-react";

// Definição dos tipos para as etapas do onboarding
interface OnboardingStep {
  title: string;
  description: string;
}

// Dados das etapas
const steps: OnboardingStep[] = [
  {
    title: "Qual é o seu nome?",
    description: "Queremos te conhecer melhor para te acompanhar nesta jornada."
  },
  {
    title: "Qual é sua idade?",
    description: "Isso nos ajuda a propor conteúdos mais adequados à sua fase da vida."
  },
  {
    title: "Há quanto tempo você é cristão?",
    description: "Assim poderemos oferecer estudos para sua maturidade espiritual."
  },
  {
    title: "Já foi batizado?",
    description: "Esta informação nos ajuda a entender sua jornada de fé."
  },
  {
    title: "Qual é sua denominação ou tradição cristã?",
    description: "Isso nos ajuda a respeitar sua tradição teológica."
  },
  {
    title: "Atualmente você participa de alguma igreja local?",
    description: "Compreender sua conexão com uma comunidade de fé."
  },
  {
    title: "Você serve em algum ministério?",
    description: "Conhecer suas áreas de serviço nos ajuda a personalizar conteúdos."
  },
  {
    title: "Você lidera algum grupo ou ministério?",
    description: "Assim podemos oferecer recursos adequados para liderança."
  },
  {
    title: "Quais são seus objetivos?",
    description: "Para personalizar sua experiência com base em seus objetivos."
  },
  {
    title: "Deseja receber sugestões de planos personalizados?",
    description: "Podemos ajudar com planos de estudo adaptados às suas necessidades."
  }
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Estado do perfil do usuário
  const [profile, setProfile] = useState({
    display_name: "",
    age_range: "",
    christian_time: "",
    baptized: false,
    denomination: "",
    church_participation: "",
    ministry_service: [] as string[],
    leadership_role: "",
    goals: [] as string[],
    wants_plan: "",
  });

  // Verificar se o usuário está logado e obter/criar perfil
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      // Verificar se já existe um perfil
      const { data: userData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userData) {
        // Se o usuário já completou o onboarding, redirecionar para a página inicial
        if (userData.onboarding_completed) {
          navigate("/");
          return;
        }
        
        // Recuperar o último passo do onboarding
        if (userData.onboarding_step && userData.onboarding_step > 1) {
          setCurrentStep(userData.onboarding_step - 1);
        }
        
        // Preencher os dados existentes
        setProfile({
          display_name: userData.display_name || "",
          age_range: userData.age_range || "",
          christian_time: userData.christian_time || "",
          baptized: userData.baptized || false,
          denomination: userData.denomination || "",
          church_participation: userData.church_participation || "",
          ministry_service: userData.ministry_service || [],
          leadership_role: userData.leadership_role || "",
          goals: userData.goals || [],
          wants_plan: userData.wants_plan || "",
        });
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Função para salvar o progresso no perfil
  const saveProgress = async (nextStep = currentStep + 1) => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente para continuar.",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }
      
      const isLastStep = nextStep >= steps.length;
      
      // Dados a serem atualizados
      const updateData = {
        ...profile,
        onboarding_step: nextStep + 1,
        onboarding_completed: isLastStep
      };
      
      // Atualizar perfil no banco de dados
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', session.user.id);
      
      if (error) throw error;
      
      if (isLastStep) {
        toast({
          title: "Perfil completo!",
          description: "Bem-vindo ao BibleChat!"
        });
        navigate("/");
      } else {
        setCurrentStep(nextStep);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar seu progresso.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para voltar para a etapa anterior
  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Renderização condicional do conteúdo conforme a etapa
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Nome
        return (
          <div className="space-y-4">
            <Label htmlFor="nome">Nome</Label>
            <Input 
              id="nome" 
              placeholder="Digite seu nome" 
              value={profile.display_name} 
              onChange={(e) => setProfile({...profile, display_name: e.target.value})}
              autoFocus
            />
            <Button 
              onClick={() => saveProgress()} 
              disabled={!profile.display_name || loading} 
              className="mt-4 w-full"
            >
              {loading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
        
      case 1: // Idade
        return (
          <div className="space-y-4">
            <Label htmlFor="age_range">Faixa etária</Label>
            <Select 
              value={profile.age_range || undefined}
              onValueChange={(value) => setProfile({...profile, age_range: value})}
            >
              <SelectTrigger id="age_range" className="w-full">
                <SelectValue placeholder="Selecione sua faixa etária" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="13-17">13-17 anos</SelectItem>
                <SelectItem value="18-25">18-25 anos</SelectItem>
                <SelectItem value="26-35">26-35 anos</SelectItem>
                <SelectItem value="36-50">36-50 anos</SelectItem>
                <SelectItem value="51+">51+ anos</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={() => saveProgress()} 
                disabled={!profile.age_range || loading} 
                className="flex-1"
              >
                {loading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 2: // Tempo como cristão
        return (
          <div className="space-y-4">
            <Label htmlFor="christian_time">Tempo como cristão</Label>
            <Select 
              value={profile.christian_time || undefined}
              onValueChange={(value) => setProfile({...profile, christian_time: value})}
            >
              <SelectTrigger id="christian_time" className="w-full">
                <SelectValue placeholder="Selecione há quanto tempo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Menos de 1 ano">Menos de 1 ano</SelectItem>
                <SelectItem value="1-3 anos">1-3 anos</SelectItem>
                <SelectItem value="4-10 anos">4-10 anos</SelectItem>
                <SelectItem value="10+ anos">10+ anos</SelectItem>
                <SelectItem value="Ainda não sou cristão">Ainda não sou cristão</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={() => saveProgress()} 
                disabled={!profile.christian_time || loading} 
                className="flex-1"
              >
                {loading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 3: // Batizado
        return (
          <div className="space-y-4">
            <Label htmlFor="baptized">Você já foi batizado?</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Button 
                type="button" 
                variant={profile.baptized ? "default" : "outline"}
                onClick={() => setProfile({...profile, baptized: true})}
                className="justify-center py-6"
              >
                Sim
              </Button>
              <Button 
                type="button" 
                variant={profile.baptized === false ? "default" : "outline"}
                onClick={() => setProfile({...profile, baptized: false})}
                className="justify-center py-6"
              >
                Ainda não
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={() => saveProgress()} 
                disabled={profile.baptized === undefined || loading} 
                className="flex-1"
              >
                {loading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 4: // Denominação
        return (
          <div className="space-y-4">
            <Label htmlFor="denomination">Denominação ou tradição cristã</Label>
            <Select 
              value={profile.denomination || undefined}
              onValueChange={(value) => setProfile({...profile, denomination: value})}
            >
              <SelectTrigger id="denomination" className="w-full">
                <SelectValue placeholder="Selecione sua denominação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Assembleia de Deus">Assembleia de Deus</SelectItem>
                <SelectItem value="Batista">Batista</SelectItem>
                <SelectItem value="Presbiteriana">Presbiteriana</SelectItem>
                <SelectItem value="Metodista">Metodista</SelectItem>
                <SelectItem value="Pentecostal">Pentecostal</SelectItem>
                <SelectItem value="Adventista">Adventista</SelectItem>
                <SelectItem value="Católica">Católica</SelectItem>
                <SelectItem value="Anglicana">Anglicana</SelectItem>
                <SelectItem value="Luterana">Luterana</SelectItem>
                <SelectItem value="Sem denominação">Sem denominação</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={() => saveProgress()} 
                disabled={!profile.denomination || loading} 
                className="flex-1"
              >
                {loading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 5: // Participação na igreja
        return (
          <div className="space-y-4">
            <Label htmlFor="church_participation">Participação em igreja local</Label>
            <Select 
              value={profile.church_participation || undefined}
              onValueChange={(value) => setProfile({...profile, church_participation: value})}
            >
              <SelectTrigger id="church_participation" className="w-full">
                <SelectValue placeholder="Selecione sua participação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sim, ativamente">Sim, ativamente</SelectItem>
                <SelectItem value="Sim, ocasionalmente">Sim, ocasionalmente</SelectItem>
                <SelectItem value="Não no momento">Não no momento</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={() => saveProgress()} 
                disabled={!profile.church_participation || loading} 
                className="flex-1"
              >
                {loading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 6: // Ministério
        const ministryOptions = [
          "Aconselhamento Pastoral",
          "Ensino e Discipulado",
          "Oração e Intercessão",
          "Louvor e Adoração",
          "Infanto-Juvenil",
          "Evangelismo e Missões",
          "Família e Reconciliação",
          "Serviço e Ação Social",
          "Comunicação e Comunidade",
          "Hospitalidade e Acolhimento",
          "Outro",
          "Não sirvo atualmente"
        ];
        
        return (
          <div className="space-y-4">
            <Label>Você serve em algum ministério?</Label>
            <div className="space-y-3 mt-2 max-h-60 overflow-y-auto pr-2">
              {ministryOptions.map((ministry) => (
                <div key={ministry} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`ministry-${ministry}`} 
                    checked={profile.ministry_service.includes(ministry)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        if (ministry === "Não sirvo atualmente") {
                          setProfile({...profile, ministry_service: ["Não sirvo atualmente"]});
                        } else {
                          const filtered = profile.ministry_service.filter(
                            item => item !== "Não sirvo atualmente"
                          );
                          setProfile({
                            ...profile, 
                            ministry_service: [...filtered, ministry]
                          });
                        }
                      } else {
                        setProfile({
                          ...profile, 
                          ministry_service: profile.ministry_service.filter(item => item !== ministry)
                        });
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`ministry-${ministry}`} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {ministry}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={() => saveProgress()} 
                disabled={profile.ministry_service.length === 0 || loading} 
                className="flex-1"
              >
                {loading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 7: // Liderança
        return (
          <div className="space-y-4">
            <Label htmlFor="leadership_role">Você lidera algum grupo ou ministério?</Label>
            <Select 
              value={profile.leadership_role || undefined}
              onValueChange={(value) => setProfile({...profile, leadership_role: value})}
            >
              <SelectTrigger id="leadership_role" className="w-full">
                <SelectValue placeholder="Selecione sua função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sim, sou pastor">Sim, sou pastor</SelectItem>
                <SelectItem value="Sim, sou discipulador/líder de célula">Sim, sou discipulador/líder de célula</SelectItem>
                <SelectItem value="Sim, coordeno ministério">Sim, coordeno ministério</SelectItem>
                <SelectItem value="Não">Não</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={() => saveProgress()} 
                disabled={!profile.leadership_role || loading} 
                className="flex-1"
              >
                {loading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 8: // Objetivos
        const goalOptions = [
          "Crescer no conhecimento bíblico",
          "Me aprofundar em teologia",
          "Preparar estudos e mensagens",
          "Ter ajuda no discipulado",
          "Consultar a Bíblia com comentários",
          "Receber devocionais",
          "Conversar com inteligência artificial sobre a fé"
        ];
        
        return (
          <div className="space-y-4">
            <Label>Quais são seus objetivos?</Label>
            <div className="space-y-3 mt-2 max-h-60 overflow-y-auto pr-2">
              {goalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`goal-${goal}`} 
                    checked={profile.goals.includes(goal)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setProfile({...profile, goals: [...profile.goals, goal]});
                      } else {
                        setProfile({
                          ...profile, 
                          goals: profile.goals.filter(item => item !== goal)
                        });
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`goal-${goal}`} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={() => saveProgress()} 
                disabled={profile.goals.length === 0 || loading} 
                className="flex-1"
              >
                {loading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      case 9: // Planos personalizados
        return (
          <div className="space-y-4">
            <Label htmlFor="wants_plan">Deseja receber sugestões de planos personalizados?</Label>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer" 
                onClick={() => setProfile({...profile, wants_plan: "plano_semanal"})}>
                <div className="flex items-center space-x-2">
                  <ToggleRight className="h-5 w-5 text-primary" />
                  <span>Sim, quero um plano de estudo semanal</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  profile.wants_plan === "plano_semanal" ? "bg-primary border-primary" : "border-gray-300"
                }`}>
                  {profile.wants_plan === "plano_semanal" && <div className="w-3 h-3 rounded-full bg-white"></div>}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer" 
                onClick={() => setProfile({...profile, wants_plan: "acompanhamento_diario"})}>
                <div className="flex items-center space-x-2">
                  <ToggleRight className="h-5 w-5 text-primary" />
                  <span>Sim, quero acompanhamento diário</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  profile.wants_plan === "acompanhamento_diario" ? "bg-primary border-primary" : "border-gray-300"
                }`}>
                  {profile.wants_plan === "acompanhamento_diario" && <div className="w-3 h-3 rounded-full bg-white"></div>}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer" 
                onClick={() => setProfile({...profile, wants_plan: "nao_agora"})}>
                <div className="flex items-center space-x-2">
                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                  <span>Não agora</span>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  profile.wants_plan === "nao_agora" ? "bg-primary border-primary" : "border-gray-300"
                }`}>
                  {profile.wants_plan === "nao_agora" && <div className="w-3 h-3 rounded-full bg-white"></div>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={goBack} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
              <Button 
                onClick={() => saveProgress()} 
                disabled={!profile.wants_plan || loading} 
                className="flex-1"
              >
                {loading ? "Finalizando..." : "Concluir"} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Renderização dos indicadores de etapa
  const renderStepIndicators = () => {
    return (
      <div className="flex justify-center space-x-1 mb-6">
        {steps.map((_, index) => (
          <div 
            key={index}
            className={`h-1 rounded-full transition-all ${
              index === currentStep 
                ? "w-6 bg-primary" 
                : index < currentStep 
                  ? "w-4 bg-primary/70" 
                  : "w-4 bg-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]-950 p-4">
      <div className="flex justify-center py-4">
        <Logo />
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          {renderStepIndicators()}
          
          <div className="space-y-2 mb-6 text-center">
            <div className="flex justify-center mb-4">
              {currentStep === 0 && <CalendarDays className="h-10 w-10 text-primary" />}
              {currentStep === 1 && <CalendarDays className="h-10 w-10 text-primary" />}
              {currentStep === 2 && <CalendarDays className="h-10 w-10 text-primary" />}
              {currentStep === 3 && <CalendarDays className="h-10 w-10 text-primary" />}
              {currentStep === 4 && <Church className="h-10 w-10 text-primary" />}
              {currentStep === 5 && <Church className="h-10 w-10 text-primary" />}
              {currentStep === 6 && <Briefcase className="h-10 w-10 text-primary" />}
              {currentStep === 7 && <Flag className="h-10 w-10 text-primary" />}
              {currentStep === 8 && <Target className="h-10 w-10 text-primary" />}
              {currentStep === 9 && <ToggleRight className="h-10 w-10 text-primary" />}
            </div>
            <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
            <p className="text-gray-500 text-sm">{steps[currentStep].description}</p>
          </div>
          
          {renderStepContent()}
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-500 py-4">
        © {new Date().getFullYear()} BibleChat - Todos os direitos reservados
      </div>
    </div>
  );
};

export default Onboarding;
