
import React from 'react';
import { Verse, BibleTranslation } from '../services/bibleService';
import { Button } from '../components/ui/button';

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
    if (!translation || !verse[translation]) {
      // Default fallback chain if translation is not valid
      return verse.text_naa || verse.text_nvi || verse.text_acf || "No text available";
    }
    // Use the selected translation or fall back to available ones
    return verse[translation] || verse.text_naa || verse.text_nvi || verse.text_acf || "No text available";
  };

  const verseText = getVerseText();

  return (
    <div className="group flex mb-4">
      <div className="mr-2 font-bold text-gray-400 pt-0.5 w-6 text-right">
        {verse.verse}
      </div>
      <div className="flex-1">
        <p className="leading-relaxed">{verseText}</p>
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
