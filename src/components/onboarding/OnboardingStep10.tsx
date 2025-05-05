
import React from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

const OnboardingStep10: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  loading
}) => {
  const planOptions = [
    { value: 'weekly', label: 'Sim, quero um plano de estudo semanal' },
    { value: 'daily', label: 'Sim, quero acompanhamento diário' },
    { value: 'none', label: 'Não agora' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <OnboardingStepLayout
      title="Deseja receber sugestões de planos personalizados?"
      subtitle=""
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup
          value={data.wants_plan || ''}
          onValueChange={(value) => onChange('wants_plan', value)}
          className="space-y-3"
        >
          {planOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
              <RadioGroupItem value={option.value} id={`plan-${option.value}`} />
              <Label htmlFor={`plan-${option.value}`} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
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
            {loading ? "Concluir" : "Concluir"}
          </Button>
        </div>
      </form>
    </OnboardingStepLayout>
  );
};

export default OnboardingStep10;
