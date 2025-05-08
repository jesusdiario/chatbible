
import React from 'react';
import { Button } from '@/components/ui/button';
import { StudyGuideFilter } from '@/biblia-online/types/studyGuide';
import { cn } from '@/lib/utils';

interface StudyGuideFilterBarProps {
  filter: StudyGuideFilter;
  setFilter: (filter: StudyGuideFilter) => void;
  counts: {
    all: number;
    completed: number;
    pending: number;
  };
}

export function StudyGuideFilterBar({ filter, setFilter, counts }: StudyGuideFilterBarProps) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilter('all')}
        className={cn(
          "text-xs",
          filter === 'all' ? "bg-gray-100" : ""
        )}
      >
        Todas ({counts.all})
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilter('completed')}
        className={cn(
          "text-xs",
          filter === 'completed' ? "bg-green-100" : ""
        )}
      >
        Concluídas ({counts.completed})
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setFilter('pending')}
        className={cn(
          "text-xs",
          filter === 'pending' ? "bg-amber-100" : ""
        )}
      >
        Pendentes ({counts.pending})
      </Button>
    </div>
  );
}
