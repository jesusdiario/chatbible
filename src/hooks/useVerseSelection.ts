
import { useState, useEffect } from 'react';
import { Verse } from '@/types/biblia';
import { fetchBibleButtons } from '@/biblia-online/services/buttonService';
import { BibleButton } from '@/biblia-online/types/buttons';

export function useVerseSelection() {
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [bibleButtons, setBibleButtons] = useState<BibleButton[]>([]);
  const [isLoadingButtons, setIsLoadingButtons] = useState(false);
  
  // Load buttons on mount
  useEffect(() => {
    const loadButtons = async () => {
      setIsLoadingButtons(true);
      try {
        const buttons = await fetchBibleButtons();
        setBibleButtons(buttons);
      } catch (err) {
        console.error('Error loading Bible buttons:', err);
      } finally {
        setIsLoadingButtons(false);
      }
    };
    
    loadButtons();
  }, []);
  
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
  
  // Format selected verses references
  const formatSelectedVerses = () => {
    if (selectedVerses.length === 0) return '';
    
    // Group by book and chapter
    const groups: Record<string, number[]> = {};
    
    selectedVerses.forEach(verse => {
      const key = `${verse.book_name || ''} ${verse.chapter || ''}`;
      if (!groups[key]) groups[key] = [];
      if (verse.verse) groups[key].push(verse.verse);
    });
    
    // Sort verse numbers and format as ranges where possible
    return Object.entries(groups).map(([bookChapter, verses]) => {
      verses.sort((a, b) => a - b);
      
      // Format consecutive verses as ranges
      const ranges: string[] = [];
      let start = verses[0];
      let end = start;
      
      for (let i = 1; i < verses.length; i++) {
        if (verses[i] === end + 1) {
          end = verses[i];
        } else {
          ranges.push(start === end ? `${start}` : `${start}-${end}`);
          start = end = verses[i];
        }
      }
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      
      return `${bookChapter}:${ranges.join(', ')}`;
    }).join('; ');
  };
  
  // Close modal and clear selection
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVerses([]);
  };
  
  return {
    selectedVerses,
    showModal,
    bibleButtons,
    isLoadingButtons,
    handleVerseSelect,
    handleCloseModal,
    setSelectedVerses,
    formatSelectedVerses
  };
}
