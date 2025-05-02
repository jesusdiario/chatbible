
import { supabase } from '@/integrations/supabase/client';
import { BibleBook, BibleCategory, Testament } from '@/types/bible';

export async function getBibleCategories(): Promise<BibleCategory[]> {
  const { data, error } = await supabase
    .from('bible_categories')
    .select('slug, title, description, display_order')
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching bible categories:', error);
    throw error;
  }

  return data as BibleCategory[] || [];
}

export async function getBibleBooks(): Promise<BibleBook[]> {
  const { data, error } = await supabase
    .from('bible_books')
    .select('slug, title, image_url, book_category, display_order')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching bible books:', error);
    throw error;
  }

  // Map the book_category field to category_slug in the returned data
  return (data || []).map(book => ({
    slug: book.slug,
    title: book.title,
    image_url: book.image_url,
    category_slug: book.book_category,
    display_order: book.display_order
  }));
}

export async function getBibleBookBySlug(slug: string): Promise<BibleBook | null> {
  const { data, error } = await supabase
    .from('bible_books')
    .select('slug, title, image_url, book_category, display_order')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('Error fetching bible book:', error);
    throw error;
  }

  // Map the book_category field to category_slug
  return {
    slug: data.slug,
    title: data.title,
    image_url: data.image_url,
    category_slug: data.book_category,
    display_order: data.display_order
  };
}

// New functions for the biblia page
export async function getAllBooks(): Promise<BibleBook[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching all books:', error);
    throw error;
  }

  return data as BibleBook[] || [];
}

export async function getTestaments(): Promise<Testament[]> {
  const { data: testamentsData, error: testamentsError } = await supabase
    .from('testaments')
    .select('*')
    .order('id');

  if (testamentsError) {
    console.error('Error fetching testaments:', testamentsError);
    throw testamentsError;
  }

  const { data: booksData, error: booksError } = await supabase
    .from('books')
    .select('*')
    .order('id');

  if (booksError) {
    console.error('Error fetching books:', booksError);
    throw booksError;
  }

  const testaments = testamentsData as Testament[] || [];
  const books = booksData as BibleBook[] || [];

  // Group books by testament
  return testaments.map(testament => {
    return {
      ...testament,
      books: books.filter(book => book.testament_id === testament.id)
    };
  });
}

export async function getBookById(id: number): Promise<BibleBook | null> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching book by id:', error);
    throw error;
  }

  return data as BibleBook;
}

export async function getMaxChapter(bookId: number): Promise<number> {
  const { data, error } = await supabase
    .from('verses')
    .select('chapter', { count: 'exact', head: true })
    .eq('book_id', bookId)
    .order('chapter', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching max chapter:', error);
    throw error;
  }

  return data && data.length > 0 ? data[0].chapter : 0;
}

export async function getVerses(bookId: number, chapter: number): Promise<any[]> {
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
