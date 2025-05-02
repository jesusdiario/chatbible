
import { supabase } from '@/integrations/supabase/client';
import { Suggestion } from '@/types/bible';

export async function loadSuggestionsForBook(bookSlug: string): Promise<Suggestion[]> {
  const { data, error } = await supabase
    .from('bible_suggestions')
    .select('*')
    .eq('book_slug', bookSlug)
    .order('id');
    
  if (error) {
    console.error('Error loading suggestions:', error);
    throw error;
  }
  
  return data || [];
}
