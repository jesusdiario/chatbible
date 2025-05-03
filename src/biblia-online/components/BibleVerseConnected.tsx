
import React, { useEffect } from 'react';
import { Verse } from '@/types/biblia';
import { BibleVerse, BibleTranslation } from './BibleVerse';
import { useVerseFavorites } from '@/hooks/useVerseFavorites';

interface BibleVerseConnectedProps {
  verse: Verse;
  translation: BibleTranslation;
  showActions?: boolean;
}

export const BibleVerseConnected: React.FC<BibleVerseConnectedProps> = ({
  verse,
  translation,
  showActions = false
}) => {
  const { favoriteStatus, handleToggleFavorite, checkFavoriteStatus } = useVerseFavorites();
  
  const verseKey = `${verse.book_id}:${verse.chapter}:${verse.verse}`;
  const isFavorite = favoriteStatus[verseKey] || false;
  
  useEffect(() => {
    if (showActions) {
      checkFavoriteStatus([verse]);
    }
  }, [verse, showActions, checkFavoriteStatus]);
  
  return (
    <BibleVerse
      verse={verse}
      translation={translation}
      showActions={showActions}
      onFavoriteToggle={handleToggleFavorite}
      isFavorite={isFavorite}
    />
  );
};
