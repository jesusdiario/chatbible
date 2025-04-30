
import { supabase } from '@/integrations/supabase/client';

export interface Suggestion {
  id: string;
  book_slug: string;
  label: string;
  user_message: string;
  prompt_override?: string;
  icon?: string;
  description?: string;
  display_order: number;
}

export async function loadSuggestionsForBook(slug: string) {
  const { data, error } = await supabase
    .from('bible_suggestions')
    .select('*')
    .eq('book_slug', slug)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Suggestion[];
}
