
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

const OnboardingStep8: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  loading
}) => {
  const leadershipOptions = [
    { value: 'pastor', label: 'Sim, sou pastor' },
    { value: 'discipulador', label: 'Sim, sou discipulador/líder de célula' },
    { value: 'ministerio', label: 'Sim, coordeno ministério' },
    { value: 'nao', label: 'Não' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const isValid = !!data.leadership_role;

  return (
    <OnboardingStepLayout
      title="Você lidera algum grupo ou ministério?"
      subtitle=""
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup
          value={data.leadership_role || ''}
          onValueChange={(value) => onChange('leadership_role', value)}
          className="space-y-3"
        >
          {leadershipOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
              <RadioGroupItem value={option.value} id={`leadership-${option.value}`} />
              <Label htmlFor={`leadership-${option.value}`} className="flex-1 cursor-pointer">
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
            disabled={!isValid || loading}
          >
            {loading ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </OnboardingStepLayout>
  );
};

export default OnboardingStep8;
