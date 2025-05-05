
import { useState } from 'react';
import { Verse } from '@/types/biblia';

export interface BibleButton {
  id: string;
  button_name: string;
  button_icon: string;
  prompt_ai: string;
  slug: string;
  created_at: string;
}

export function useVerseSelection() {
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  
  // Formata a referência dos versículos selecionados
  const getVerseReference = () => {
    if (selectedVerses.length === 0) return '';
    
    // Ordena os versículos por capítulo e número
    const sortedVerses = [...selectedVerses].sort((a, b) => {
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });
    
    // Se só temos um versículo
    if (sortedVerses.length === 1) {
      const verse = sortedVerses[0];
      return `${verse.book_name} ${verse.chapter}:${verse.verse}`;
    }
    
    // Se temos versículos consecutivos do mesmo capítulo
    const allSameChapter = sortedVerses.every(v => v.chapter === sortedVerses[0].chapter);
    const allConsecutive = allSameChapter && sortedVerses.every((v, i) => {
      if (i === 0) return true;
      return v.verse === sortedVerses[i - 1].verse + 1;
    });
    
    if (allSameChapter && allConsecutive) {
      return `${sortedVerses[0].book_name} ${sortedVerses[0].chapter}:${sortedVerses[0].verse}-${sortedVerses[sortedVerses.length - 1].verse}`;
    }
    
    // Se são do mesmo capítulo mas não consecutivos
    if (allSameChapter) {
      const verses = sortedVerses.map(v => v.verse).join(',');
      return `${sortedVerses[0].book_name} ${sortedVerses[0].chapter}:${verses}`;
    }
    
    // Se são de capítulos diferentes
    const firstVerse = sortedVerses[0];
    const lastVerse = sortedVerses[sortedVerses.length - 1];
    return `${firstVerse.book_name} ${firstVerse.chapter}:${firstVerse.verse}-${lastVerse.chapter}:${lastVerse.verse}`;
  };
  
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
  
  // Check if verse is selected
  const isVerseSelected = (verse: Verse) => {
    return selectedVerses.some(v => 
      v.book_id === verse.book_id && 
      v.chapter === verse.chapter && 
      v.verse === verse.verse
    );
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
    isVerseSelected,
    setSelectedVerses,
    getVerseReference
  };
}
