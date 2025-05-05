import { useState } from 'react';
import { Verse } from '../services/bibleService';
import { supabase } from '@/integrations/supabase/client';

/**
 * useVerseSelection — Hook para seleção de versículos e ações contextuais.
 *
 * 🌟 2025‑05‑05 PATCH‑C
 *   • Adicionado `orientationText` constante para exibir nota abaixo dos botões.
 *   • Exportado via objeto retornado para que o componente de UI mostre
 *     "Você pode fechar esta janela e selecionar mais versículos do capítulo para analisar".
 */

export interface BibleButton {
  id: string;
  button_name: string;
  button_icon: string;
  prompt_ai: string;
  slug: string;
  created_at: string;
}

export function useVerseSelection() {
  /*──────────── Estados internos ────────────*/
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [bibleButtons, setBibleButtons] = useState<BibleButton[]>([]);
  const [isLoadingButtons, setIsLoadingButtons] = useState(false);

  /*──────────── Texto de orientação ────────────*/
  const orientationText =
    'Você pode fechar esta janela e selecionar mais versículos do capítulo para analisar';

  /*──────────── Helpers ────────────*/
  const getVerseReference = () => {
    if (selectedVerses.length === 0) return '';
    const sorted = [...selectedVerses].sort((a, b) =>
      a.chapter !== b.chapter ? a.chapter - b.chapter : a.verse - b.verse
    );
    if (sorted.length === 1) return `${sorted[0].book_name} ${sorted[0].chapter}:${sorted[0].verse}`;
    const sameChapter = sorted.every(v => v.chapter === sorted[0].chapter);
    const consecutive = sameChapter && sorted.every((v, i) => (i === 0 ? true : v.verse === sorted[i - 1].verse + 1));
    if (sameChapter && consecutive)
      return `${sorted[0].book_name} ${sorted[0].chapter}:${sorted[0].verse}-${sorted[sorted.length - 1].verse}`;
    if (sameChapter)
      return `${sorted[0].book_name} ${sorted[0].chapter}:${sorted.map(v => v.verse).join(',')}`;
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return `${first.book_name} ${first.chapter}:${first.verse}-${last.chapter}:${last.verse}`;
  };

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

  /*──────────── Supabase ────────────*/
  const loadBibleButtons = async () => {
    setIsLoadingButtons(true);
    try {
      const { data, error } = await supabase.from('biblia_buttons').select('*').order('created_at');
      if (error) {
        console.error('Erro ao carregar botões:', error);
        return;
      }
      setBibleButtons(
        (data || []).map(b => ({
          id: String(b.id ?? ''),
          button_name: b.button_name ?? '',
          button_icon: b.button_icon ?? 'book-open',
          prompt_ai: b.prompt_ai ?? '',
          slug: b.slug ?? '',
          created_at: b.created_at ?? new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error('Erro ao buscar botões:', err);
    } finally {
      setIsLoadingButtons(false);
    }
  };

  /*──────────── Interações ────────────*/
  const handleVerseSelect = (verse: Verse) => {
    const isSelected = selectedVerses.some(
      v => v.book_id === verse.book_id && v.chapter === verse.chapter && v.verse === verse.verse
    );
    if (isSelected) {
      const updated = selectedVerses.filter(
        v => v.book_id !== verse.book_id || v.chapter !== verse.chapter || v.verse !== verse.verse
      );
      setSelectedVerses(updated);
      if (updated.length === 0) setShowModal(false);
    } else {
      const newList = [...selectedVerses, verse];
      setSelectedVerses(newList);
      if (selectedVerses.length === 0) {
        loadBibleButtons();
        setShowModal(true);
      }
    }
  };

  const isVerseSelected = (verse: Verse) =>
    selectedVerses.some(v => v.book_id === verse.book_id && v.chapter === verse.chapter && v.verse === verse.verse);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  /*──────────── Exposed API ────────────*/
  return {
    selectedVerses,
    showModal,
    bibleButtons,
    isLoadingButtons,
    orientationText,
    handleVerseSelect,
    handleCloseModal,
    isVerseSelected,
    getVerseReference,
    getSelectedVersesText,
    setSelectedVerses,
  };
}