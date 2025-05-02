
import { supabase } from '@/integrations/supabase/client';
import { Suggestion } from '@/types/bible';

export async function loadSuggestionsForBook(slug: string): Promise<Suggestion[]> {
  const { data, error } = await supabase
    .from('bible_suggestions')
    .select('*')
    .eq('book_slug', slug)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data as Suggestion[];
}
