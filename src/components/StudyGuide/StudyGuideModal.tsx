
import { X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StudyGuideItem } from './StudyGuideItem';
import { StudySuggestionItem } from '@/hooks/useStudySuggestions';
import { Suggestion } from '@/services/suggestionsService';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface StudyGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: StudySuggestionItem[];
  isLoading: boolean;
  progress: number;
  onToggleComplete: (suggestion: Suggestion) => Promise<void>;
  onSelectSuggestion: (suggestion: Suggestion) => void;
}

export function StudyGuideModal({
  open,
  onOpenChange,
  suggestions,
  isLoading,
  progress,
  onToggleComplete,
  onSelectSuggestion
}: StudyGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle>Guia de Estudo</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-2 mb-4">
          <Progress value={progress} className="h-2" />
          <div className="text-right text-xs mt-1 text-gray-500">
            {progress}% concluído
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner />
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <StudyGuideItem 
                key={suggestion.id}
                suggestion={suggestion}
                onToggleComplete={onToggleComplete}
                onClick={onSelectSuggestion}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhuma sugestão de estudo disponível para este livro.
            </div>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button>Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
