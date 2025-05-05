
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

const OnboardingStep7: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  loading
}) => {
  const ministryOptions = [
    { value: 'pastoral', label: 'Aconselhamento Pastoral' },
    { value: 'ensino', label: 'Ensino e Discipulado' },
    { value: 'oracao', label: 'Oração e Intercessão' },
    { value: 'louvor', label: 'Louvor e Adoração' },
    { value: 'infantojuvenil', label: 'Infanto-Juvenil' },
    { value: 'evangelismo', label: 'Evangelismo e Missões' },
    { value: 'familia', label: 'Família e Reconciliação' },
    { value: 'social', label: 'Serviço e Ação Social' },
    { value: 'comunicacao', label: 'Comunicação e Comunidade' },
    { value: 'hospitalidade', label: 'Hospitalidade e Acolhimento' },
    { value: 'outro', label: 'Outro' },
    { value: 'nenhum', label: 'Não sirvo atualmente' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const toggleMinistry = (value: string) => {
    const currentMinistries = data.ministry_service || [];
    if (currentMinistries.includes(value)) {
      onChange('ministry_service', currentMinistries.filter((v: string) => v !== value));
    } else {
      onChange('ministry_service', [...currentMinistries, value]);
    }
  };

  return (
    <OnboardingStepLayout
      title="Você serve em algum ministério?"
      subtitle="Selecione todas as opções aplicáveis"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {ministryOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-2 border p-3 rounded-md hover:bg-gray-50">
              <Checkbox 
                id={`ministry-${option.value}`}
                checked={(data.ministry_service || []).includes(option.value)}
                onCheckedChange={() => toggleMinistry(option.value)}
                className="mt-1"
              />
              <Label 
                htmlFor={`ministry-${option.value}`}
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

export default OnboardingStep7;
