
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
  console.log('Fetching books');
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }

  console.log('Books retrieved:', data?.length);
  return data || [];
}

export async function getTestaments(): Promise<Testament[]> {
  console.log('Fetching testaments');
  const { data, error } = await supabase
    .from('testaments')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching testaments:', error);
    throw error;
  }

  console.log('Testaments retrieved:', data?.length);
  return data || [];
}

export async function getBook(bookId: number): Promise<Book | null> {
  console.log('Fetching book with ID:', bookId);
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single();
    
  if (error) {
    console.error('Error fetching book:', error);
    if (error.code === 'PGRST116') {
      // No results found
      return null;
    }
    throw error;
  }

  console.log('Book retrieved:', data?.name);
  return data;
}

export async function getVersesByBook(bookId: number): Promise<Verse[]> {
  console.log('Fetching verses for book ID:', bookId);
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

  console.log('Verses retrieved:', data?.length);
  return data || [];
}

// Add sample data if tables are empty - this is temporary helper function
export async function createInitialData() {
  // Check if testaments table is empty
  const { data: testamentsData } = await supabase
    .from('testaments')
    .select('id')
    .limit(1);
    
  if (testamentsData && testamentsData.length === 0) {
    console.log('Adding initial testaments');
    await supabase.from('testaments').insert([
      { id: 1, name: 'Antigo Testamento' },
      { id: 2, name: 'Novo Testamento' }
    ]);
  }
  
  // Check if books table is empty
  const { data: booksData } = await supabase
    .from('books')
    .select('id')
    .limit(1);
    
  if (booksData && booksData.length === 0) {
    console.log('Adding initial books');
    // Add a few sample books
    await supabase.from('books').insert([
      { id: 1, name: 'Gênesis', abbrev: 'Gn', testament_id: 1 },
      { id: 2, name: 'Êxodo', abbrev: 'Ex', testament_id: 1 },
      { id: 3, name: 'Levítico', abbrev: 'Lv', testament_id: 1 },
      { id: 40, name: 'Mateus', abbrev: 'Mt', testament_id: 2 },
      { id: 41, name: 'Marcos', abbrev: 'Mc', testament_id: 2 },
      { id: 42, name: 'Lucas', abbrev: 'Lc', testament_id: 2 },
      { id: 66, name: 'Apocalipse', abbrev: 'Ap', testament_id: 2 }
    ]);
  }
}
