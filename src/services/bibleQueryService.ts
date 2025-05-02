
import { supabase } from '@/integrations/supabase/client';
import { BibleBook, Verse, Testament } from '@/types/bible';

export async function getTestaments(): Promise<Testament[]> {
  const { data, error } = await supabase
    .from('testaments')
    .select('id, name')
    .order('id', { ascending: true });
    
  if (error) {
    console.error('Error fetching testaments:', error);
    throw error;
  }

  return data.map(item => ({
    slug: item.id.toString(),
    title: item.name || ''
  }));
}

export async function getBooksByTestament(testamentId: string): Promise<BibleBook[]> {
  const { data, error } = await supabase
    .from('books')
    .select('id, name, abbrev')
    .eq('testament_id', parseInt(testamentId))
    .order('id', { ascending: true });
    
  if (error) {
    console.error('Error fetching books by testament:', error);
    throw error;
  }

  return data.map(book => ({
    slug: book.id.toString(),
    title: book.name || '',
    image_url: null,
    category_slug: book.testament_id?.toString() || '',
    display_order: book.id
  }));
}

export async function getBook(bookId: string): Promise<BibleBook | null> {
  const { data, error } = await supabase
    .from('books')
    .select('id, name, abbrev, testament_id')
    .eq('id', parseInt(bookId))
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching book:', error);
    throw error;
  }

  return {
    slug: data.id.toString(),
    title: data.name || '',
    image_url: null,
    category_slug: data.testament_id?.toString() || '',
    display_order: data.id
  };
}

export async function getVersesByBookAndChapter(bookId: string, chapter: number): Promise<Verse[]> {
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', parseInt(bookId))
    .eq('chapter', chapter)
    .order('verse', { ascending: true });
    
  if (error) {
    console.error('Error fetching verses:', error);
    throw error;
  }

  return data;
}

export async function getChapterCount(bookId: string): Promise<number> {
  const { data, error } = await supabase
    .from('verses')
    .select('chapter')
    .eq('book_id', parseInt(bookId))
    .order('chapter', { ascending: false })
    .limit(1);
    
  if (error || !data.length) {
    console.error('Error fetching chapter count:', error);
    return 0;
  }

  return data[0].chapter || 0;
}

export async function searchBible(query: string, bookId?: string): Promise<Verse[]> {
  let queryBuilder = supabase
    .from('verses')
    .select('id, book_id, chapter, verse, text, version')
    .ilike('text', `%${query}%`)
    .order('book_id')
    .order('chapter')
    .order('verse')
    .limit(100);

  if (bookId) {
    queryBuilder = queryBuilder.eq('book_id', parseInt(bookId));
  }
    
  const { data, error } = await queryBuilder;
    
  if (error) {
    console.error('Error searching Bible:', error);
    throw error;
  }

  return data;
}
