
import { Check } from 'lucide-react';
import { StudySuggestionItem } from '@/hooks/useStudySuggestions';
import { cn } from '@/lib/utils';

interface StudyGuideItemProps {
  suggestion: StudySuggestionItem;
  onToggleComplete: (suggestion: StudySuggestionItem) => void;
  onClick: (suggestion: StudySuggestionItem) => void;
}

export function StudyGuideItem({ suggestion, onToggleComplete, onClick }: StudyGuideItemProps) {
  const handleClick = () => {
    onClick(suggestion);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click handler
    onToggleComplete(suggestion);
  };

  return (
    <div
      className={cn(
        "p-3 mb-2 border rounded-lg cursor-pointer flex items-center justify-between transition-all",
        suggestion.isCompleted 
          ? "bg-yellow-50 border-yellow-200" 
          : "bg-white hover:bg-gray-50 border-gray-200"
      )}
      onClick={handleClick}
    >
      <span className="flex-1">{suggestion.label}</span>
      <button
        className={cn(
          "ml-2 p-2 rounded-full transition-all flex-shrink-0",
          suggestion.isCompleted 
            ? "bg-green-100 text-green-600" 
            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
        )}
        onClick={handleToggleComplete}
        aria-label={suggestion.isCompleted ? "Marcar como não concluído" : "Marcar como concluído"}
      >
        <Check size={16} />
      </button>
    </div>
  );
}
