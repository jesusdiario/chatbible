
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

const OnboardingStep2: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  loading
}) => {
  const ageRanges = [
    { value: '13-17', label: '13–17 anos' },
    { value: '18-25', label: '18–25 anos' },
    { value: '26-35', label: '26–35 anos' },
    { value: '36-50', label: '36–50 anos' },
    { value: '51+', label: '51+ anos' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const isValid = !!data.age_range;

  return (
    <OnboardingStepLayout
      title="Qual é sua idade?"
      subtitle="Isso nos ajuda a propor conteúdos mais adequados à sua fase da vida."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <RadioGroup
          value={data.age_range || ''}
          onValueChange={(value) => onChange('age_range', value)}
          className="space-y-3"
        >
          {ageRanges.map((range) => (
            <div key={range.value} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
              <RadioGroupItem value={range.value} id={`age-${range.value}`} />
              <Label htmlFor={`age-${range.value}`} className="flex-1 cursor-pointer">
                {range.label}
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

export default OnboardingStep2;
