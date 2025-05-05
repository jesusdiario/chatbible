
import { supabase } from '../integrations/supabase/client';
import { BibleButton } from '../types/buttons';

export const fetchBibleButtons = async (): Promise<BibleButton[]> => {
  try {
    const { data, error } = await supabase
      .from('biblia_buttons')
      .select('*')
      .order('order_buttons', { ascending: true });
    
    if (error) {
      console.error('Error fetching bible buttons:', error);
      return [];
    }
    
    // Transform the data to match the BibleButton interface
    return data.map(item => ({
      id: item.id.toString(),
      button_name: item.button_name || '',
      button_icon: item.button_icon || '',
      prompt_ai: item.prompt_ai || '',
      slug: item.slug || '',
      created_at: item.created_at
    }));
  } catch (err) {
    console.error('Unexpected error fetching bible buttons:', err);
    return [];
  }
};
