
import { Verse } from '@/types/biblia';
import { useBibleFavorites } from './useBiblia';

export function useVerseFavorites() {
  const { isFavorite, addFavorite, removeFavorite } = useBibleFavorites();
  
  // Toggle a single verse favorite status
  const handleToggleFavorite = (verse: Verse) => {
    if (isFavorite(verse)) {
      removeFavorite(verse);
    } else {
      addFavorite(verse);
    }
  };
  
  // Add multiple verses to favorites
  const handleAddToFavorites = (verses: Verse[]) => {
    if (verses && verses.length) {
      verses.forEach(verse => addFavorite(verse));
    }
  };
  
  return {
    isFavorite,
    handleToggleFavorite,
    handleAddToFavorites
  };
}
