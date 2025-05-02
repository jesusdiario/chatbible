
import { supabase } from '@/integrations/supabase/client';

export interface Book {
  id: number;
  name: string;
  abbrev: string;
  testament_id: number;
}

export interface Testament {
  id: number;
  name: string;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number | null;
  verse: number | null;
  text: string | null;
  version: string | null;
}

export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }

  return data || [];
}

export async function getTestaments(): Promise<Testament[]> {
  const { data, error } = await supabase
    .from('testaments')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching testaments:', error);
    throw error;
  }

  return data || [];
}

export async function getBook(bookId: number): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single();
    
  if (error) {
    console.error('Error fetching book:', error);
    if (error.code === 'PGRST116') {
      // Nenhum resultado encontrado
      return null;
    }
    throw error;
  }

  return data;
}

export async function getVersesByBook(bookId: number): Promise<Verse[]> {
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', bookId)
    .order('chapter')
    .order('verse');
    
  if (error) {
    console.error('Error fetching verses:', error);
    throw error;
  }

  return data || [];
}
