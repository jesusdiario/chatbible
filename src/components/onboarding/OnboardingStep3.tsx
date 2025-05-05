
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

const OnboardingStep3: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  loading
}) => {
  const christianTimeOptions = [
    { value: 'less-than-1', label: 'Menos de 1 ano' },
    { value: '1-3', label: '1–3 anos' },
    { value: '4-10', label: '4–10 anos' },
    { value: '10+', label: '10+ anos' },
    { value: 'not-yet', label: 'Ainda não sou cristão' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const isValid = !!data.christian_time;

  return (
    <OnboardingStepLayout
      title="Há quanto tempo você é cristão?"
      subtitle="Assim poderemos oferecer estudos para sua maturidade espiritual."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup
          value={data.christian_time || ''}
          onValueChange={(value) => onChange('christian_time', value)}
          className="space-y-3"
        >
          {christianTimeOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
              <RadioGroupItem value={option.value} id={`christian-time-${option.value}`} />
              <Label htmlFor={`christian-time-${option.value}`} className="flex-1 cursor-pointer">
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

export default OnboardingStep3;
