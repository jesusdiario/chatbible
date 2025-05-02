
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useBibleChapters(bookId: number | null) {
  const fetchChapterCount = async (): Promise<number> => {
    if (!bookId) return 0;
    
    const { count, error } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('book_id', bookId)
      .order('chapter', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error fetching chapter count:', error);
      throw error;
    }
    
    // Se não conseguirmos obter a contagem exata, vamos tentar outro método
    if (count === null) {
      const { data, error: chaptersError } = await supabase
        .from('verses')
        .select('chapter')
        .eq('book_id', bookId)
        .order('chapter', { ascending: false })
        .limit(1);
      
      if (chaptersError) {
        console.error('Error fetching max chapter:', chaptersError);
        throw chaptersError;
      }
      
      return data && data.length > 0 ? data[0].chapter : 0;
    }
    
    return count || 0;
  };

  return useQuery({
    queryKey: ['chapters', bookId],
    queryFn: fetchChapterCount,
    staleTime: 1000 * 60 * 60, // 1 hora
    enabled: !!bookId
  });
}
