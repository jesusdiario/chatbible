
import { supabase } from '@/integrations/supabase/client';

export interface BibleCategory {
  slug: string;
  title: string;
  display_order?: number;
}

export interface BibleBook {
  slug: string;
  title: string;
  image_url: string | null;
  category_slug?: string;  // Make optional to accommodate both structures
  book_category?: string;  // Added to match Supabase schema
  category_id?: string;    // Added to match Supabase schema
  display_order?: number;
}

export async function getBibleCategories(): Promise<BibleCategory[]> {
  const { data, error } = await supabase
    .from('bible_categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching bible categories:', error);
    throw error;
  }

  return data || [];
}

export async function getBibleBooks(): Promise<BibleBook[]> {
  const { data, error } = await supabase
    .from('bible_books')
    .select('*, bible_categories(slug)')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching bible books:', error);
    throw error;
  }

  // Transform the data to include category_slug from the joined table
  const transformedData = data.map(book => ({
    ...book,
    category_slug: book.bible_categories?.slug || book.book_category
  }));

  return transformedData;
}

export async function getBibleBookBySlug(slug: string): Promise<BibleBook | null> {
  const { data, error } = await supabase
    .from('bible_books')
    .select('*, bible_categories(slug)')
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

  // Transform the data to include category_slug
  const book = data ? {
    ...data,
    category_slug: data.bible_categories?.slug || data.book_category
  } : null;

  return book;
}
