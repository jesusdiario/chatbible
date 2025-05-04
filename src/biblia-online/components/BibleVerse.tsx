import React from 'react';
import { Verse, BibleTranslation } from '@/services/bibleService';
import { Button } from '@/components/ui/button';

interface BibleVerseProps {
  verse: Verse;
  translation: BibleTranslation;
  showActions?: boolean;
}

export const BibleVerse: React.FC<BibleVerseProps> = ({
  verse,
  translation,
  showActions = false,
}) => {
  // Determine which verse text to show based on selected translation
  const getVerseText = () => {
    if (translation === BibleTranslation.Default || !verse[translation]) {
      return verse.text_naa || verse.text; // Default to NAA or any available text
    }
    return verse[translation] || verse.text_naa || verse.text; // Fallback if translation not available
  };

  return (
    <div className="group flex mb-4">
      <div className="mr-2 font-bold text-gray-400 pt-0.5 w-6 text-right">
        {verse.verse}
      </div>
      <div className="flex-1">
        <p className="leading-relaxed">{getVerseText()}</p>
        {showActions && (
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <Button variant="outline" size="sm">
              Salvar
            </Button>
            <Button variant="outline" size="sm">
              Compartilhar
            </Button>
            <Button variant="outline" size="sm">
              Copiar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
