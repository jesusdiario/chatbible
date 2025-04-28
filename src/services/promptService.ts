
import { supabase } from '@/integrations/supabase/client';

export const getPromptForBook = async (bookSlug?: string): Promise<string | null> => {
  if (!bookSlug) return null;

  const { data } = await supabase
    .from('bible_prompts')
    .select('prompt_text')
    .eq('book_slug', bookSlug)
    .single();

  return data?.prompt_text ?? null;
};
