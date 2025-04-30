
import React from 'react';
import { useBibleSuggestions } from '@/hooks/useBibleSuggestions';
import { useBibleBook } from '@/hooks/useBibleBook';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { icons } from 'lucide-react';

interface BookSuggestionsModalProps {
  bookSlug: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSuggestion: (message: string) => void;
}

const BookSuggestionsModal: React.FC<BookSuggestionsModalProps> = ({
  bookSlug,
  isOpen,
  onClose,
  onSelectSuggestion,
}) => {
  const { t } = useTranslation();
  const { data: suggestions, isLoading } = useBibleSuggestions(bookSlug);
  const { bookDetails } = useBibleBook(bookSlug);

  const handleSuggestionClick = (message: string) => {
    onSelectSuggestion(message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">
            {t('suggestions.readyQuestions')} - {bookDetails?.title || bookSlug}
          </DialogTitle>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="grid gap-2">
              {suggestions.map((suggestion) => {
                // Get icon component if available
                const IconComponent = suggestion.icon 
                  ? icons[suggestion.icon as keyof typeof icons] 
                  : undefined;

                return (
                  <button
                    key={suggestion.id}
                    className="text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-start gap-3"
                    onClick={() => handleSuggestionClick(suggestion.user_message)}
                  >
                    <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {IconComponent ? (
                        <IconComponent className="h-3.5 w-3.5" />
                      ) : (
                        <span>?</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{suggestion.label}</p>
                      {suggestion.description && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          {suggestion.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('suggestions.notAvailable')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookSuggestionsModal;
