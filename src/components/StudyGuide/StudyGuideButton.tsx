
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudyGuideModal } from './StudyGuideModal';
import { useStudySuggestions } from '@/hooks/useStudySuggestions';
import { Suggestion } from '@/services/suggestionsService';

interface StudyGuideButtonProps {
  bookSlug: string;
  onSelectSuggestion: (suggestion: Suggestion) => void;
}

export function StudyGuideButton({ bookSlug, onSelectSuggestion }: StudyGuideButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    suggestions, 
    isLoading, 
    toggleSuggestionCompleted, 
    progress 
  } = useStudySuggestions(bookSlug);
  
  const handleToggleComplete = async (suggestion: Suggestion) => {
    await toggleSuggestionCompleted(suggestion);
  };
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline" 
        className="flex items-center gap-2"
      >
        <BookOpen className="h-4 w-4" />
        Guia de Estudo
      </Button>
      
      <StudyGuideModal 
        open={isOpen}
        onOpenChange={setIsOpen}
        suggestions={suggestions}
        isLoading={isLoading}
        progress={progress}
        onToggleComplete={handleToggleComplete}
        onSelectSuggestion={(suggestion) => {
          onSelectSuggestion(suggestion);
          setIsOpen(false);
        }}
      />
    </>
  );
}
