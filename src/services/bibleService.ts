
import { supabase } from '@/integrations/supabase/client';

export interface BibleCategory {
  slug: string;
  title: string;
  display_order?: number;
}

export interface BibleBook {
  slug: string;
  title: string;
  image_url: string;
  category_slug: string;
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
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching bible books:', error);
    throw error;
  }

  return data || [];
}

export async function getBibleBookBySlug(slug: string): Promise<BibleBook | null> {
  const { data, error } = await supabase
    .from('bible_books')
    .select('*')
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

  return data;
}
