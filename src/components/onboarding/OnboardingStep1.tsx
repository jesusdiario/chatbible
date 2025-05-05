
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const OnboardingStep1: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  loading
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const isValid = !!data.display_name?.trim();

  return (
    <OnboardingStepLayout
      title="Qual é o seu nome?"
      subtitle="Queremos te conhecer melhor para te acompanhar nesta jornada."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            placeholder="Seu nome"
            value={data.display_name || ''}
            onChange={(e) => onChange('display_name', e.target.value)}
            autoFocus
            required
            className="text-lg"
          />
        </div>
        
        <div className="pt-4">
          <Button 
            type="submit"
            className="w-full bg-[#4483f4]"
            disabled={!isValid || loading}
          >
            {loading ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </OnboardingStepLayout>
  );
};

export default OnboardingStep1;
