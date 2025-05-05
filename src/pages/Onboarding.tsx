
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";
import OnboardingStep5 from "@/components/onboarding/OnboardingStep5";
import OnboardingStep6 from "@/components/onboarding/OnboardingStep6";
import OnboardingStep7 from "@/components/onboarding/OnboardingStep7";
import OnboardingStep8 from "@/components/onboarding/OnboardingStep8";
import OnboardingStep9 from "@/components/onboarding/OnboardingStep9";
import OnboardingStep10 from "@/components/onboarding/OnboardingStep10";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import Logo from "@/components/Logo";
import LoadingSpinner from "@/components/LoadingSpinner";

const Onboarding = () => {
  const { step = "1" } = useParams();
  const stepNumber = parseInt(step, 10);
  const totalSteps = 10;
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [savingData, setSavingData] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>({
    display_name: '',
    age_range: '',
    christian_time: '',
    baptized: null,
    denomination: '',
    church_participation: '',
    ministry_service: [],
    leadership_role: '',
    goals: [],
    wants_plan: '',
    onboarding_step: stepNumber
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Verificar se o usuário já completou o onboarding
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seus dados.",
          variant: "destructive"
        });
      }

      if (profile) {
        // Se o onboarding já foi completado, redirecionar para a página inicial
        if (profile.onboarding_completed) {
          navigate('/');
          return;
        }

        // Se o usuário estava em uma etapa diferente, redirecionar para ela
        const savedStep = profile.onboarding_step || 1;
        if (savedStep !== stepNumber) {
          navigate(`/onboarding/${savedStep}`);
          return;
        }

        // Preencher dados existentes
        setProfileData({
          ...profileData,
          ...profile
        });
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate, toast, stepNumber]);

  const handleChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveDataAndNavigate = async (nextStep: number) => {
    if (!user) return;
    
    setSavingData(true);
    
    try {
      const isLastStep = nextStep > totalSteps;
      const dataToUpdate = {
        ...profileData,
        onboarding_step: isLastStep ? totalSteps : nextStep,
        onboarding_completed: isLastStep
      };
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id, 
          ...dataToUpdate 
        });

      if (error) throw error;
      
      if (isLastStep) {
        toast({
          title: "Onboarding concluído",
          description: "Bem-vindo ao BibleChat!"
        });
        navigate('/');
      } else {
        navigate(`/onboarding/${nextStep}`);
      }
    } catch (error: any) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar seus dados.",
        variant: "destructive"
      });
    } finally {
      setSavingData(false);
    }
  };

  const handleNext = () => {
    const nextStep = stepNumber + 1;
    saveDataAndNavigate(nextStep);
  };

  const handleBack = () => {
    if (stepNumber > 1) {
      navigate(`/onboarding/${stepNumber - 1}`);
    }
  };

  const handleSkip = () => {
    saveDataAndNavigate(totalSteps + 1);
  };

  // Renderiza o spinner de loading enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#ffffff] p-4">
        <Logo size="lg" className="mb-8" />
        <LoadingSpinner />
      </div>
    );
  }

  // Componente para o layout comum dos passos de onboarding
  const renderStep = () => {
    const commonProps = {
      data: profileData,
      onChange: handleChange,
      onNext: handleNext,
      onBack: handleBack,
      onSkip: handleSkip,
      loading: savingData
    };

    switch (stepNumber) {
      case 1:
        return <OnboardingStep1 {...commonProps} />;
      case 2:
        return <OnboardingStep2 {...commonProps} />;
      case 3:
        return <OnboardingStep3 {...commonProps} />;
      case 4:
        return <OnboardingStep4 {...commonProps} />;
      case 5:
        return <OnboardingStep5 {...commonProps} />;
      case 6:
        return <OnboardingStep6 {...commonProps} />;
      case 7:
        return <OnboardingStep7 {...commonProps} />;
      case 8:
        return <OnboardingStep8 {...commonProps} />;
      case 9:
        return <OnboardingStep9 {...commonProps} />;
      case 10:
        return <OnboardingStep10 {...commonProps} />;
      default:
        navigate('/onboarding/1');
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      <header className="p-4 flex justify-center border-b">
        <Logo size="md" />
      </header>
      
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4">
        <OnboardingProgress currentStep={stepNumber} totalSteps={totalSteps} />
        <div className="mt-8 flex-1">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
