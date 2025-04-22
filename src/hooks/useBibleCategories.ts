
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBibleCategories() {
  return useQuery({
    queryKey: ['bible-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_categories')
        .select('slug, title')
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    }
  });
}
