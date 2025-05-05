
import { useState } from 'react';
import { Verse } from '@/types/biblia';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type BibliaButton = {
  id: number;
  button_name: string;
  prompt_ai: string;
  order_buttons?: number;
}

export function useVerseSelection() {
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [bibliaButtons, setBibliaButtons] = useState<BibliaButton[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
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
      
      // If first verse selected, load buttons and open modal
      if (selectedVerses.length === 0) {
        loadBibliaButtons();
        setShowModal(true);
      }
    }
  };
  
  // Load buttons from database
  const loadBibliaButtons = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('biblia_buttons')
        .select('*')
        .order('order_buttons', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setBibliaButtons(data || []);
    } catch (error) {
      console.error('Error loading biblia buttons:', error);
      toast({
        title: 'Erro ao carregar botões',
        description: 'Não foi possível carregar as ações disponíveis.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get reference string like "Gênesis 1:1" or "Gênesis 1:1-3" for multiple verses
  const getVerseReferenceString = () => {
    if (selectedVerses.length === 0) return '';
    
    // Sort verses by chapter and verse number
    const sortedVerses = [...selectedVerses].sort((a, b) => {
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });
    
    const bookName = sortedVerses[0].book_name;
    const firstChapter = sortedVerses[0].chapter;
    const lastChapter = sortedVerses[sortedVerses.length - 1].chapter;
    
    // If all verses are from the same chapter
    if (firstChapter === lastChapter) {
      const firstVerse = sortedVerses[0].verse;
      const lastVerse = sortedVerses[sortedVerses.length - 1].verse;
      
      // If it's a single verse
      if (firstVerse === lastVerse) {
        return `${bookName} ${firstChapter}:${firstVerse}`;
      }
      
      // If it's a range of verses in the same chapter
      return `${bookName} ${firstChapter}:${firstVerse}-${lastVerse}`;
    }
    
    // If verses span multiple chapters
    return `${bookName} ${firstChapter}:${sortedVerses[0].verse}-${lastChapter}:${sortedVerses[sortedVerses.length - 1].verse}`;
  };
  
  // Get the full text of selected verses
  const getSelectedVersesText = () => {
    return selectedVerses.map(verse => {
      // First try to use NAA, then fallback to other translations
      const verseText = verse.text_naa || verse.text_nvi || verse.text_acf || verse.text_ara || ''; 
      return `${verse.book_name} ${verse.chapter}:${verse.verse} - ${verseText}`;
    }).join('\n\n');
  };
  
  // Handle button click to open chat with selected verses
  const handleButtonClick = (button: BibliaButton) => {
    if (selectedVerses.length === 0) return;
    
    const reference = getVerseReferenceString();
    const versesText = getSelectedVersesText();
    const promptAi = button.prompt_ai;
    
    // Get the book slug from the first selected verse
    const bookSlug = selectedVerses[0].book_slug;
    
    if (!bookSlug) {
      toast({
        title: 'Erro',
        description: 'Livro não identificado.',
        variant: 'destructive'
      });
      return;
    }
    
    // Navigate to chat page with the selected verses
    navigate(`/livros-da-biblia/${bookSlug}`, {
      state: {
        initialPrompt: versesText,
        promptOverride: promptAi.replace('{referencia}', reference)
      }
    });
    
    // Close modal and clear selection
    setShowModal(false);
    setSelectedVerses([]);
  };
  
  // Close modal and clear selection
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVerses([]);
  };
  
  return {
    selectedVerses,
    showModal,
    isLoading,
    bibliaButtons,
    getVerseReferenceString,
    handleVerseSelect,
    handleButtonClick,
    handleCloseModal,
  };
}
