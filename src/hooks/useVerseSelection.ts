
import { useState } from 'react';
import { Verse } from '@/types/biblia';

export function useVerseSelection() {
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Handle verse selection/deselection
  const handleVerseSelect = (verse: Verse) => {
    // Check if already selected
    const isSelected = selectedVerses.some(v => v.id === verse.id);
    
    if (isSelected) {
      // Remove from selection
      setSelectedVerses(prev => prev.filter(v => v.id !== verse.id));
      
      // If was the last selected verse, close the modal
      if (selectedVerses.length === 1) {
        setShowModal(false);
      }
    } else {
      // Add to selection
      setSelectedVerses(prev => [...prev, verse]);
      
      // If first verse selected, open modal
      if (selectedVerses.length === 0) {
        setShowModal(true);
      }
    }
  };
  
  // Close modal and clear selection
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVerses([]);
  };
  
  return {
    selectedVerses,
    showModal,
    handleVerseSelect,
    handleCloseModal,
    setSelectedVerses
  };
}
