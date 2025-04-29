
import { supabase } from '@/integrations/supabase/client';

export interface Suggestion {
  id: string;
  label: string;
  user_message: string;
  book_slug: string;
  icon?: string;
  description?: string;
  prompt_override?: string;
}

export const loadSuggestionsForBook = async (bookSlug: string): Promise<Suggestion[]> => {
  try {
    const { data, error } = await supabase
      .from('bible_suggestions')
      .select('*')
      .eq('book_slug', bookSlug);
      
    if (error) {
      console.error('Error loading suggestions:', error);
      return [];
    }
    
    return data as Suggestion[];
  } catch (error) {
    console.error('Error in loadSuggestionsForBook:', error);
    return [];
  }
};
