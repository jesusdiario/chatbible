
import { useState, useEffect } from 'react';
import { Book } from '@/types/bible';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useBibleBooks(searchTerm: string = '') {
  const fetchBooks = async (): Promise<Book[]> => {
    let query = supabase.from('books').select('*').order('id');
    
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
    
    return data || [];
  };

  return useQuery({
    queryKey: ['books', searchTerm],
    queryFn: fetchBooks,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useBookById(bookId: number | null) {
  const fetchBook = async (): Promise<Book | null> => {
    if (!bookId) return null;
    
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      console.error('Error fetching book:', error);
      throw error;
    }
    
    return data;
  };

  return useQuery({
    queryKey: ['book', bookId],
    queryFn: fetchBook,
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!bookId
  });
}
