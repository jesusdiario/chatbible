
import { supabase } from '@/integrations/supabase/client';

export interface BibleCategory {
  slug: string;
  title: string;
  description?: string;
}

export interface BibleBook {
  slug: string;
  title: string;
  image_url: string | null;
  category_slug: string;
}

export async function getBibleCategories(): Promise<BibleCategory[]> {
  const { data, error } = await supabase
    .from('bible_categories')
    .select('slug, title, description');
    
  if (error) {
    console.error('Error fetching bible categories:', error);
    throw error;
  }

  return data || [];
}

export async function getBibleBooks(): Promise<BibleBook[]> {
  const { data, error } = await supabase
    .from('bible_books')
    .select('*, bible_categories(slug)');

  if (error) {
    console.error('Error fetching bible books:', error);
    throw error;
  }

  // Transform the data to include category_slug from the joined table
  const transformedData = data.map(book => ({
    slug: book.slug,
    title: book.title,
    image_url: book.image_url,
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
    slug: data.slug,
    title: data.title,
    image_url: data.image_url,
    category_slug: data.bible_categories?.slug || data.book_category
  } : null;

  return book;
}
