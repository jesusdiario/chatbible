
import React from 'react';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface StudyGuideButtonProps {
  onClick: () => void;
  className?: string;
}

export function StudyGuideButton({ onClick, className }: StudyGuideButtonProps) {
  const { t } = useTranslation();
  
  return (
    <Button
      onClick={onClick}
      variant="ghost" 
      className={cn("flex gap-2 items-center", className)}
    >
      <Book className="h-4 w-4" />
      <span>Guia de Estudo</span>
    </Button>
  );
}
