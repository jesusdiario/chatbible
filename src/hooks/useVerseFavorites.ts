
import { useState, useEffect } from 'react';
import { Verse } from '@/types/biblia';
import { useBibleFavorites } from './useBiblia';

export function useVerseFavorites() {
  const { isFavorite, addFavorite, removeFavorite } = useBibleFavorites();
  const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({});
  
  // Toggle a single verse favorite status
  const handleToggleFavorite = async (verse: Verse) => {
    const verseKey = `${verse.book_id}:${verse.chapter}:${verse.verse}`;
    const isFav = favoriteStatus[verseKey];
    
    if (isFav) {
      const success = await removeFavorite(verse);
      if (success) {
        setFavoriteStatus(prev => ({
          ...prev,
          [verseKey]: false
        }));
      }
    } else {
      const success = await addFavorite(verse);
      if (success) {
        setFavoriteStatus(prev => ({
          ...prev,
          [verseKey]: true
        }));
      }
    }
  };
  
  // Check if verses are favorites
  const checkFavoriteStatus = async (verses: Verse[]) => {
    const statuses: Record<string, boolean> = {};
    
    for (const verse of verses) {
      if (verse.book_id && verse.chapter && verse.verse) {
        const verseKey = `${verse.book_id}:${verse.chapter}:${verse.verse}`;
        statuses[verseKey] = await isFavorite(verse);
      }
    }
    
    setFavoriteStatus(statuses);
  };
  
  return {
    favoriteStatus,
    handleToggleFavorite,
    checkFavoriteStatus
  };
}
