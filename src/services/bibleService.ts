
import { supabase } from '@/integrations/supabase/client';
import { Book, Verse } from '@/types/bible';

export async function getAllBooks(): Promise<Book[]> {
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

export async function getBookById(id: number): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    console.error('Error fetching book:', error);
    throw error;
  }
  
  return data;
}

export async function getVersesByBookAndChapter(bookId: number, chapter: number): Promise<Verse[]> {
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
  
  return data || [];
}

export async function getMaxChapterByBookId(bookId: number): Promise<number> {
  const { data, error } = await supabase
    .from('verses')
    .select('chapter')
    .eq('book_id', bookId)
    .order('chapter', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('Error fetching max chapter:', error);
    throw error;
  }
  
  return data && data.length > 0 ? data[0].chapter : 0;
}

export async function searchVerses(query: string): Promise<Verse[]> {
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .textSearch('text', query)
    .limit(50);
    
  if (error) {
    console.error('Error searching verses:', error);
    throw error;
  }
  
  return data || [];
}
