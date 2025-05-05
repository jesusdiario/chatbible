
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
  /*──────────────────── Estados internos ────────────────────*/
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [bibleButtons, setBibleButtons] = useState<BibleButton[]>([]);
  const [isLoadingButtons, setIsLoadingButtons] = useState(false);
  
  /*──────────────────── Utilidades ────────────────────*/
  /**
   * Devolve string de referência (ex.: "Rm 8:28‑30") baseada na seleção.
   */
  const getVerseReference = () => {
    if (selectedVerses.length === 0) return '';
    
    // 🔢 Ordena por capítulo → versículo
    const sortedVerses = [...selectedVerses].sort((a, b) => {
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });
    
    /* Casos de formatação -------------------------------------*/
    if (sortedVerses.length === 1) {
      const v = sortedVerses[0];
      return `${v.book_name} ${v.chapter}:${v.verse}`;
    }
    
    const allSameChapter = sortedVerses.every(v => v.chapter === sortedVerses[0].chapter);
    const allConsecutive =
      allSameChapter &&
      sortedVerses.every((v, i) => (i === 0 ? true : v.verse === sortedVerses[i - 1].verse + 1));
    
    if (allSameChapter && allConsecutive) {
      return `${sortedVerses[0].book_name} ${sortedVerses[0].chapter}:${sortedVerses[0].verse}-${
        sortedVerses[sortedVerses.length - 1].verse
      }`;
    }
    
    if (allSameChapter) {
      const verses = sortedVerses.map(v => v.verse).join(',');
      return `${sortedVerses[0].book_name} ${sortedVerses[0].chapter}:${verses}`;
    }
    
    const first = sortedVerses[0];
    const last = sortedVerses[sortedVerses.length - 1];
    return `${first.book_name} ${first.chapter}:${first.verse}-${last.chapter}:${last.verse}`;
  };
  
  /**
   * Concatena texto completo dos versículos escolhidos, preservando formatação.
   * @param translation Chave da tradução preferida (ex.: "text_nvi")
   */
  const getSelectedVersesText = (translation: string) =>
    selectedVerses
      .map(v => {
        const text =
          v[translation] ||
          v.text_naa ||
          v.text_nvi ||
          v.text_acf ||
          v.text_ara ||
          v.text_ntlh ||
          v.text_nvt ||
          '';
        return `${v.book_name} ${v.chapter}:${v.verse} ${text}`;
      })
      .join('\n\n');
  
  /*──────────────────── Supabase ────────────────────*/
  /** Carrega botões de ação (tabela `biblia_buttons`). */
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
      
      const formatted: BibleButton[] = (data || []).map(b => ({
        id: String(b.id ?? ''),
        button_name: b.button_name ?? '',
        button_icon: b.button_icon ?? 'book-open',
        prompt_ai: b.prompt_ai ?? '',
        slug: b.slug ?? '',
        created_at: b.created_at ?? new Date().toISOString(),
      }));
      setBibleButtons(formatted);
    } catch (err) {
      console.error('Erro ao buscar botões:', err);
    } finally {
      setIsLoadingButtons(false);
    }
  };
  
  /*──────────────────── Interações com UI ────────────────────*/
  /** Alterna seleção de um versículo específico. */
  const handleVerseSelect = (verse: Verse) => {
    const isSelected = selectedVerses.some(
      v => v.book_id === verse.book_id && v.chapter === verse.chapter && v.verse === verse.verse
    );
    
    if (isSelected) {
      // Remove
      setSelectedVerses(prev =>
        prev.filter(v => v.book_id !== verse.book_id || v.chapter !== verse.chapter || v.verse !== verse.verse)
      );
      if (selectedVerses.length === 1) setShowModal(false);
    } else {
      // Adiciona
      setSelectedVerses(prev => [...prev, verse]);
      if (selectedVerses.length === 0) {
        loadBibleButtons();
        setShowModal(true);
      }
    }
  };
  
  /** Verifica se um versículo está na seleção atual. */
  const isVerseSelected = (verse: Verse) =>
    selectedVerses.some(
      v => v.book_id === verse.book_id && v.chapter === verse.chapter && v.verse === verse.verse
    );
  
  /** Fecha modal e limpa seleção. */
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedVerses([]);
  };
  
  /*──────────────────── API pública do hook ────────────────────*/
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
