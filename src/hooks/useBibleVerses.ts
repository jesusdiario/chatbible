
import { useState, useEffect } from 'react';
import { Verse, VerseWithReference } from '@/types/bible';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useBookById } from './useBibleBooks';

export function useBibleVerses(bookId: number | null, chapter: number | null) {
  const { data: book } = useBookById(bookId);
  
  const fetchVerses = async (): Promise<VerseWithReference[]> => {
    if (!bookId || !chapter) return [];
    
    const { data, error } = await supabase
      .from('verses')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .order('verse');
    
    if (error) {
      console.error('Error fetching verses:', error);
      throw error;
    }
    
    return data?.map(verse => ({
      ...verse,
      bookName: book?.name || '',
      bookAbbrev: book?.abbrev || ''
    })) || [];
  };

  return useQuery({
    queryKey: ['verses', bookId, chapter],
    queryFn: fetchVerses,
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: !!bookId && !!chapter && !!book
  });
}
