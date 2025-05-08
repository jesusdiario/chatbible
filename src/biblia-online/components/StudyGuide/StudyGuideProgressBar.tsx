
import React from 'react';
import { Progress } from '@/biblia-online/components/ui/progress';

interface StudyGuideProgressBarProps {
  value: number;
}

export function StudyGuideProgressBar({ value }: StudyGuideProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-xs text-gray-500">
        <span>Progresso</span>
        <span>{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
