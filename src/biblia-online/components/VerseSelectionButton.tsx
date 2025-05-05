
import React from 'react';
import { BookOpen } from 'lucide-react';
import { Verse } from '../services/bibleService';

interface VerseSelectionButtonProps {
  selectedVerses: Verse[];
  showModal: boolean;
  onOpenModal: () => void;
}

export const VerseSelectionButton: React.FC<VerseSelectionButtonProps> = ({
  selectedVerses,
  showModal,
  onOpenModal
}) => {
  if (selectedVerses.length === 0 || showModal) {
    return null;
  }

  return (
    <button
      onClick={onOpenModal}
      className="fixed bottom-24 right-4 bg-primary text-white rounded-full p-3 shadow-lg z-50 md:bottom-28"
      aria-label="Ver versículos selecionados"
    >
      <div className="relative">
        <BookOpen className="h-6 w-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {selectedVerses.length}
        </span>
      </div>
    </button>
  );
};
