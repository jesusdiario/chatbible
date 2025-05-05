
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

const OnboardingStep4: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  loading
}) => {
  const baptizedOptions = [
    { value: true, label: 'Sim' },
    { value: false, label: 'Ainda não' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const isValid = data.baptized !== null;

  return (
    <OnboardingStepLayout
      title="Já foi batizado?"
      subtitle=""
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup
          value={data.baptized === null ? undefined : data.baptized.toString()}
          onValueChange={(value) => onChange('baptized', value === 'true')}
          className="space-y-3"
        >
          {baptizedOptions.map((option) => (
            <div key={String(option.value)} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
              <RadioGroupItem value={String(option.value)} id={`baptized-${String(option.value)}`} />
              <Label htmlFor={`baptized-${String(option.value)}`} className="flex-1 cursor-pointer">
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

export default OnboardingStep4;
