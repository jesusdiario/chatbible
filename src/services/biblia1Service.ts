
import { supabase } from '@/integrations/supabase/client';

export interface Book {
  id: number;
  name: string;
  abbrev: string;
  testament_id: number;
}

export interface Testament {
  id: number;
  name: string;
}

export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }

  return data || [];
}

export async function getTestaments(): Promise<Testament[]> {
  const { data, error } = await supabase
    .from('testaments')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching testaments:', error);
    throw error;
  }

  return data || [];
}
