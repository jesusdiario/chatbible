
import { useState } from 'react';
import { Verse } from '@/types/biblia';

export function useVerseSelection() {
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showModal, setShowModal] = useState(false);
  
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
  
  // Check if verse is selected
  const isVerseSelected = (verse: Verse) => {
    return selectedVerses.some(v => 
      v.book_id === verse.book_id && 
      v.chapter === verse.chapter && 
      v.verse === verse.verse
    );
  };
  
  // Get verse reference text
  const getVerseReference = () => {
    if (selectedVerses.length === 0) return '';
    
    // Sort verses by chapter and number
    const sortedVerses = [...selectedVerses].sort((a, b) => {
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });
    
    // If we have a single verse
    if (sortedVerses.length === 1) {
      const verse = sortedVerses[0];
      return `${verse.book_name} ${verse.chapter}:${verse.verse}`;
    }
    
    // If we have consecutive verses from the same chapter
    const allSameChapter = sortedVerses.every(v => v.chapter === sortedVerses[0].chapter);
    const allConsecutive = allSameChapter && sortedVerses.every((v, i) => {
      if (i === 0) return true;
      return v.verse === sortedVerses[i - 1].verse + 1;
    });
    
    if (allSameChapter && allConsecutive) {
      return `${sortedVerses[0].book_name} ${sortedVerses[0].chapter}:${sortedVerses[0].verse}-${sortedVerses[sortedVerses.length - 1].verse}`;
    }
    
    // If verses are from the same chapter but not consecutive
    if (allSameChapter) {
      const verses = sortedVerses.map(v => v.verse).join(',');
      return `${sortedVerses[0].book_name} ${sortedVerses[0].chapter}:${verses}`;
    }
    
    // If verses are from different chapters
    const firstVerse = sortedVerses[0];
    const lastVerse = sortedVerses[sortedVerses.length - 1];
    return `${firstVerse.book_name} ${firstVerse.chapter}:${firstVerse.verse}-${lastVerse.chapter}:${lastVerse.verse}`;
  };
  
  // Get selected verses text
  const getSelectedVersesText = (translation: string) => {
    return selectedVerses.map(verse => {
      const text = verse[translation] || 
                  verse.text_naa || 
                  verse.text_nvi || 
                  verse.text_acf || 
                  verse.text_ara || 
                  verse.text_ntlh || 
                  verse.text_nvt || 
                  '';
      return `${verse.book_name} ${verse.chapter}:${verse.verse} ${text}`;
    }).join('\n\n');
  };
  
  // Close modal and clear selection
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // BibleButton type definition (for compatibility with the existing code)
  export interface BibleButton {
    id: string;
    button_name: string;
    button_icon: string;
    prompt_ai: string;
    slug: string;
    created_at: string;
  }
  
  // Mock data for testing without the database
  const bibleButtons: BibleButton[] = [];
  const isLoadingButtons = false;
  
  return {
    selectedVerses,
    showModal,
    bibleButtons,
    isLoadingButtons,
    handleVerseSelect,
    handleCloseModal,
    isVerseSelected,
    getVerseReference,
    getSelectedVersesText,
    setSelectedVerses
  };
}
