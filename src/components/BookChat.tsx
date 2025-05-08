
import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { BookChatContainer } from './BookChatContainer';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { StudyGuideModal } from './StudyGuide/StudyGuideModal';
import { useStudySuggestions, StudySuggestionItem } from '@/hooks/useStudySuggestions';

interface BookChatProps {
  bookSlug: string;
  chatSlug: string;
  suggestions: any[];
  onSelectSuggestion: (suggestion: any) => void;
}

export const BookChat: React.FC<BookChatProps> = ({
  bookSlug,
  chatSlug,
  suggestions,
  onSelectSuggestion,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [studyGuideOpen, setStudyGuideOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const { 
    suggestions: studySuggestions, 
    isLoading: studySuggestionsLoading, 
    toggleSuggestionCompleted,
    progress
  } = useStudySuggestions(bookSlug);

  const handleToggleComplete = async (suggestion: StudySuggestionItem) => {
    await toggleSuggestionCompleted(suggestion);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Mobile sheet for suggestions */}
      {isMobile && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="mb-4 md:hidden"
            >
              Ver todas as perguntas
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-[350px] overflow-y-auto">
            <div className="py-4">
              <h2 className="text-lg font-semibold mb-4">Guia de Estudo</h2>
              <div className="space-y-2">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                      suggestion.id === chatSlug ? "bg-blue-50 border border-blue-200" : "border"
                    }`}
                    onClick={() => {
                      onSelectSuggestion(suggestion);
                      setSheetOpen(false);
                    }}
                  >
                    {suggestion.label}
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="hidden md:block md:w-1/4 border-r border-gray-200 pr-4">
          <div className="sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Guia de Estudo</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStudyGuideOpen(true)}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Ver progresso
              </Button>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                    suggestion.id === chatSlug
                      ? "bg-blue-50 border border-blue-200"
                      : "border"
                  }`}
                  onClick={() => onSelectSuggestion(suggestion)}
                >
                  {suggestion.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat container */}
      <div className="flex-1 md:w-3/4">
        <BookChatContainer bookSlug={bookSlug} chatSlug={chatSlug} />
      </div>
      
      {/* Study Guide Modal */}
      <StudyGuideModal
        open={studyGuideOpen}
        onOpenChange={setStudyGuideOpen}
        suggestions={studySuggestions}
        isLoading={studySuggestionsLoading}
        progress={progress}
        onToggleComplete={handleToggleComplete}
        onSelectSuggestion={(suggestion) => {
          onSelectSuggestion(suggestion);
          setStudyGuideOpen(false);
        }}
      />
    </div>
  );
};
