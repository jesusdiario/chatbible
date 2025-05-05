
import { supabase } from '../integrations/supabase/client';
import { BibleButton } from '../types/buttons';

export const fetchBibleButtons = async (): Promise<BibleButton[]> => {
  try {
    // We need to use a more generic approach to avoid TypeScript errors since
    // the biblia_buttons table isn't in the TypeScript definitions yet
    const response = await (supabase as any)
      .from('biblia_buttons')
      .select('*')
      .order('order_buttons', { ascending: true });
    
    const { data, error } = response as any;
    
    if (error) {
      console.error('Error fetching bible buttons:', error);
      return [];
    }
    
    // Verificando se temos dados antes de tentar mapeá-los
    if (!data || data.length === 0) {
      return [];
    }

    // Convertendo explicitamente os dados para o formato BibleButton
    return data.map(item => ({
      id: item.id?.toString() || '',
      button_name: item.button_name || '',
      button_icon: item.button_icon || '',
      prompt_ai: item.prompt_ai || '',
      slug: item.slug || '',
      created_at: item.created_at || ''
    }));
  } catch (err) {
    console.error('Unexpected error fetching bible buttons:', err);
    return [];
  }
};
