
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import OnboardingStepLayout from './OnboardingStepLayout';

interface OnboardingStepProps {
  data: any;
  onChange: (field: string, value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  loading: boolean;
}

const OnboardingStep5: React.FC<OnboardingStepProps> = ({
  data,
  onChange,
  onNext,
  onBack,
  loading
}) => {
  const [open, setOpen] = useState(false);
  
  const denominations = [
    { value: 'assembleia', label: 'Assembleia de Deus' },
    { value: 'batista', label: 'Batista' },
    { value: 'presbiteriana', label: 'Presbiteriana' },
    { value: 'metodista', label: 'Metodista' },
    { value: 'pentecostal', label: 'Pentecostal' },
    { value: 'adventista', label: 'Adventista' },
    { value: 'catolica', label: 'Católica' },
    { value: 'anglicana', label: 'Anglicana' },
    { value: 'luterana', label: 'Luterana' },
    { value: 'semDenominacao', label: 'Sem denominação' },
    { value: 'outro', label: 'Outro' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const selectedDenomination = denominations.find(d => d.value === data.denomination);

  return (
    <OnboardingStepLayout
      title="Qual é sua denominação ou tradição cristã?"
      subtitle=""
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-12"
            >
              {selectedDenomination ? selectedDenomination.label : "Selecione sua denominação..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar denominação..." />
              <CommandEmpty>Denominação não encontrada.</CommandEmpty>
              <CommandGroup className="max-h-60 overflow-y-auto">
                {denominations.map((denomination) => (
                  <CommandItem
                    key={denomination.value}
                    value={denomination.value}
                    onSelect={() => {
                      onChange('denomination', denomination.value);
                      setOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        data.denomination === denomination.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {denomination.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

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
            disabled={!data.denomination || loading}
          >
            {loading ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </OnboardingStepLayout>
  );
};

export default OnboardingStep5;
