
import { useState } from 'react';
import { Verse } from '../services/bibleService';
import { supabase } from '@/integrations/supabase/client';

// Interface para os botões de ação bíblica
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
  const [showModal, setShowModal] = useState(false);
  const [bibleButtons, setBibleButtons] = useState<BibleButton[]>([]);
  const [isLoadingButtons, setIsLoadingButtons] = useState(false);
  
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
  
  // Recupera o texto completo dos versículos selecionados
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
  
  // Carrega botões da tabela biblia_buttons
  const loadBibleButtons = async () => {
    setIsLoadingButtons(true);
    try {
      const { data, error } = await supabase
        .from('biblia_buttons')
        .select('*')
        .order('created_at');
        
      if (error) {
        console.error('Erro ao carregar botões:', error);
        return;
      }
      
      if (data) {
        // Transforma os dados para garantir que tenham a estrutura correta para BibleButton
        const formattedButtons: BibleButton[] = data.map(button => ({
          id: String(button.id || ''), // Converte o id para string
          button_name: button.button_name || '',
          button_icon: button.button_icon || 'book-open', // Valor padrão se não existir
          prompt_ai: button.prompt_ai || '',
          slug: button.slug || '', // Valor padrão se não existir
          created_at: button.created_at || new Date().toISOString()
        }));
        
        setBibleButtons(formattedButtons);
      }
    } catch (err) {
      console.error('Erro ao buscar botões:', err);
    } finally {
      setIsLoadingButtons(false);
    }
  };
  
  // Manipula a seleção/desseleção de versículo
  const handleVerseSelect = (verse: Verse) => {
    // Verifica se já está selecionado
    const isSelected = selectedVerses.some(v => 
      v.book_id === verse.book_id && 
      v.chapter === verse.chapter && 
      v.verse === verse.verse
    );
    
    if (isSelected) {
      // Remove da seleção
      setSelectedVerses(prev => prev.filter(v => 
        v.book_id !== verse.book_id || 
        v.chapter !== verse.chapter || 
        v.verse !== verse.verse
      ));
    } else {
      // Adiciona à seleção
      setSelectedVerses(prev => [...prev, verse]);
      
      // Se é o primeiro versículo selecionado, carrega os botões
      if (selectedVerses.length === 0) {
        loadBibleButtons();
      }
    }
    
    // Se temos versículos selecionados após esta operação e o modal está fechado, abrimos o modal
    if ((isSelected && selectedVerses.length > 1) || (!isSelected)) {
      if (!showModal) {
        setShowModal(true);
      }
    }
    
    // Se não temos mais versículos selecionados, fechamos o modal
    if (isSelected && selectedVerses.length === 1) {
      setShowModal(false);
    }
  };
  
  // Verifica se um versículo está selecionado
  const isVerseSelected = (verse: Verse) => {
    return selectedVerses.some(v => 
      v.book_id === verse.book_id && 
      v.chapter === verse.chapter && 
      v.verse === verse.verse
    );
  };
  
  // Fecha modal mas mantém a seleção
  const handleCloseModal = () => {
    setShowModal(false);
    // Não limpa mais a seleção de versículos: setSelectedVerses([]);
  };
  
  // Remove todos os versículos selecionados
  const clearSelection = () => {
    setSelectedVerses([]);
    setShowModal(false);
  };
  
  // Abre o modal se já houver versículos selecionados
  const openModalWithSelection = () => {
    if (selectedVerses.length > 0) {
      if (!bibleButtons.length) {
        loadBibleButtons();
      }
      setShowModal(true);
    }
  };
  
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
    setSelectedVerses,
    clearSelection,
    openModalWithSelection
  };
}
