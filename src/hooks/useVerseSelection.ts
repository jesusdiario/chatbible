
import { useState } from 'react';
import { Verse } from '@/types/biblia';

export function useVerseSelection() {
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  
  // Handle verse selection/deselection
  const handleVerseSelect = (verse: Verse) => {
    // Check if already selected
    const isSelected = selectedVerses.some(v => 
      v.book_id === verse.book_id && 
      v.chapter === verse.chapter && 
      v.verse === verse.verse
    );
    
    if (isSelected) {
      // Remove from selection
      setSelectedVerses(prev => prev.filter(v => 
        v.book_id !== verse.book_id || 
        v.chapter !== verse.chapter || 
        v.verse !== verse.verse
      ));
      
      // If was the last selected verse, close the bottom sheet
      if (selectedVerses.length === 1) {
        setShowBottomSheet(false);
      }
    } else {
      // Add to selection
      setSelectedVerses(prev => [...prev, verse]);
      
      // If first verse selected, open bottom sheet
      if (selectedVerses.length === 0) {
        setShowBottomSheet(true);
      }
    }
  };
  
  // Close bottom sheet and clear selection
  const handleCloseBottomSheet = () => {
    setShowBottomSheet(false);
    setSelectedVerses([]);
  };
  
  return {
    selectedVerses,
    showBottomSheet,
    handleVerseSelect,
    handleCloseBottomSheet,
    setSelectedVerses
  };
}
