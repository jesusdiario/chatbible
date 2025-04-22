
import { supabase } from '@/integrations/supabase/client';

export interface BibleCategory {
  slug: string;
  title: string;
  description?: string;
  display_order: number;
}

export interface BibleBook {
  slug: string;
  title: string;
  image_url: string | null;
  category_slug: string;
  display_order: number;
}

export async function getBibleCategories(): Promise<BibleCategory[]> {
  const { data, error } = await supabase
    .from('bible_categories')
    .select('slug, title, description, display_order')
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
