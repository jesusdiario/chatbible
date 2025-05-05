
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import OnboardingStepLayout from './OnboardingStepLayout';

interface OnboardingStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  loading: boolean;
}

const OnboardingStep9: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  loading
}) => {
  const goalOptions = [
    { value: 'knowledge', label: 'Crescer no conhecimento bíblico' },
    { value: 'theology', label: 'Me aprofundar em teologia' },
    { value: 'prepare', label: 'Preparar estudos e mensagens' },
    { value: 'discipleship', label: 'Ter ajuda no discipulado' },
    { value: 'commentary', label: 'Consultar a Bíblia com comentários' },
    { value: 'devotional', label: 'Receber devocionais' },
    { value: 'ai', label: 'Conversar com inteligência artificial sobre a fé' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const toggleGoal = (value: string) => {
    const currentGoals = data.goals || [];
    if (currentGoals.includes(value)) {
      onChange('goals', currentGoals.filter((v: string) => v !== value));
    } else {
      onChange('goals', [...currentGoals, value]);
    }
  };

  return (
    <OnboardingStepLayout
      title="Quais são seus objetivos?"
      subtitle="Selecione todas as opções aplicáveis"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          {goalOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-2 border p-3 rounded-md hover:bg-gray-50">
              <Checkbox 
                id={`goal-${option.value}`}
                checked={(data.goals || []).includes(option.value)}
                onCheckedChange={() => toggleGoal(option.value)}
                className="mt-1"
              />
              <Label 
                htmlFor={`goal-${option.value}`}
                className="flex-1 cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-3 pt-4">
          <Button 
            type="button" 
            onClick={onBack}
            variant="outline" 
            className="flex-1"
          >
            Voltar
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-[#4483f4]"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </OnboardingStepLayout>
  );
};

export default OnboardingStep9;
