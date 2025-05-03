
import { supabase } from '@/integrations/supabase/client';
import { Verse, BibleVersion } from '@/types/biblia';
import { toNumber } from '@/utils/bibliaUtils';

// Função para obter os versículos de um livro e capítulo específicos
export async function getVersesByBookChapter(
  bookId: string | number, 
  chapter: string | number, 
  version: BibleVersion = 'naa'
): Promise<Verse[]> {
  const bookIdNum = toNumber(bookId);
  const chapterNum = toNumber(chapter);
  
  if (bookIdNum === undefined || chapterNum === undefined) {
    throw new Error('Book ID e Chapter devem ser números válidos');
  }
  
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', bookIdNum)
    .eq('chapter', chapterNum);
    
  if (error) {
    console.error(`Erro ao buscar versículos para ${bookIdNum} capítulo ${chapterNum}:`, error);
    throw error;
  }

  return data as Verse[];
}

// Função para obter um versículo específico
export async function getVerse(
  bookId: string | number,
  chapter: string | number,
  verse: string | number,
  version: BibleVersion = 'naa'
): Promise<Verse | null> {
  try {
    const bookIdNum = toNumber(bookId);
    const chapterNum = toNumber(chapter);
    const verseNum = toNumber(verse);
    
    if (bookIdNum === undefined || chapterNum === undefined || verseNum === undefined) {
      throw new Error('Book ID, Chapter e Verse devem ser números válidos');
    }
    
    const { data, error } = await supabase
      .from('verses')
      .select('*')
      .eq('book_id', bookIdNum)
      .eq('chapter', chapterNum)
      .eq('verse', verseNum);
      
    if (error) {
      console.error(`Erro ao buscar versículo ${bookIdNum} ${chapterNum}:${verseNum}:`, error);
      throw error;
    }

    return data.length > 0 ? data[0] as Verse : null;
  } catch (error) {
    console.error(`Erro ao buscar versículo:`, error);
    throw error;
  }
}
