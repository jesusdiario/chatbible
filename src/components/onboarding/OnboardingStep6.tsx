
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

const OnboardingStep6: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  loading
}) => {
  const participationOptions = [
    { value: 'active', label: 'Sim, ativamente' },
    { value: 'occasional', label: 'Sim, ocasionalmente' },
    { value: 'no', label: 'Não no momento' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const isValid = !!data.church_participation;

  return (
    <OnboardingStepLayout
      title="Atualmente você participa de alguma igreja local?"
      subtitle=""
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup
          value={data.church_participation || ''}
          onValueChange={(value) => onChange('church_participation', value)}
          className="space-y-3"
        >
          {participationOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
              <RadioGroupItem value={option.value} id={`participation-${option.value}`} />
              <Label htmlFor={`participation-${option.value}`} className="flex-1 cursor-pointer">
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

export default OnboardingStep6;
