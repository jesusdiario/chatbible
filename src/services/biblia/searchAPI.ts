
import { supabase } from '@/integrations/supabase/client';
import { Verse, BibleVersion } from '@/types/biblia';

// Função para buscar versículos por palavra-chave
export async function searchVerses(query: string, version: BibleVersion = 'acf'): Promise<Verse[]> {
  const textColumn = `text_${version}` as keyof Verse;
  
  try {
    // Usando busca de texto simples para maior compatibilidade
    const { data, error } = await supabase
      .from('verses')
      .select('*')
      .ilike(textColumn as string, `%${query}%`)
      .limit(50);
      
    if (error) {
      console.error(`Erro ao buscar versículos com a palavra-chave "${query}":`, error);
      throw error;
    }

    return data as Verse[] || [];
  } catch (error) {
    console.error(`Erro na busca de texto: ${error}`);
    return [];
  }
}
