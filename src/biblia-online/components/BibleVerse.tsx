
import React from 'react';
import { Verse } from '@/types/biblia';
import { Button } from '@/components/ui/button';
import { BookmarkIcon, Share2Icon, CopyIcon } from 'lucide-react';
import { useVerseFavorites } from '@/hooks/useVerseFavorites';

export enum BibleTranslation {
  NVI = 'text_nvi',
  ACF = 'text_acf',
  ARA = 'text_ara',
  ARC = 'text_arc',
  NAA = 'text_naa',
  NTLH = 'text_ntlh',
  NVT = 'text_nvt',
  Default = 'text_naa' // Usando NAA como padrão
}

interface BibleVerseProps {
  verse: Verse;
  translation: BibleTranslation;
  showActions?: boolean;
  onFavoriteToggle?: (verse: Verse) => void;
  isFavorite?: boolean;
}

export const BibleVerse: React.FC<BibleVerseProps> = ({
  verse,
  translation,
  showActions = false,
  onFavoriteToggle,
  isFavorite = false,
}) => {
  // Determine which verse text to show based on selected translation
  const getVerseText = () => {
    if (translation === BibleTranslation.Default || !verse[translation]) {
      return verse.text_naa || verse.text_nvi || verse.text_acf; // Default to NAA or any available text
    }
    return verse[translation] || verse.text_naa || verse.text_nvi || verse.text_acf; // Fallback if translation not available
  };

  const handleCopyVerse = () => {
    const reference = `${verse.book_name} ${verse.chapter}:${verse.verse}`;
    const text = getVerseText();
    navigator.clipboard.writeText(`${reference} - ${text}`);
    // Add toast notification here if you have a toast system
  };

  const handleShareVerse = () => {
    const reference = `${verse.book_name} ${verse.chapter}:${verse.verse}`;
    const text = getVerseText();
    if (navigator.share) {
      navigator.share({
        title: reference,
        text: `${reference} - ${text}`,
        url: window.location.href,
      }).catch(err => console.error('Erro ao compartilhar:', err));
    }
  };

  const handleFavoriteToggle = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(verse);
    }
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleFavoriteToggle}
              className={isFavorite ? "bg-yellow-100" : ""}
            >
              <BookmarkIcon className={`h-4 w-4 mr-1 ${isFavorite ? "text-yellow-500" : ""}`} />
              {isFavorite ? "Salvo" : "Salvar"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareVerse}>
              <Share2Icon className="h-4 w-4 mr-1" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyVerse}>
              <CopyIcon className="h-4 w-4 mr-1" />
              Copiar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
