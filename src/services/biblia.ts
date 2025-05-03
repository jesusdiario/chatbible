
import { supabase } from '@/integrations/supabase/client';
import { BibleBook } from '@/types/biblia';

export async function getBibleBooks(): Promise<BibleBook[]> {
  const { data, error } = await supabase
    .from('books_mv')
    .select('id, name, abbrev, slug, chapter_count')
    .order('id');
    
  if (error) {
    console.error('Erro ao buscar livros da Bíblia:', error);
    throw new Error('Falha ao carregar os livros da Bíblia');
  }
  
  return data.map(book => ({
    id: book.id,
    name: book.name,
    abbrev: book.abbrev,
    slug: book.slug,
    title: book.name, // Adicionando title igual ao name
    category_slug: '',
    display_order: book.id,
    image_url: null
  }));
}

export async function getBookChapters(bookId: number): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('books_mv')
      .select('chapter_count')
      .eq('id', bookId)
      .single();

    if (error) throw error;
    return data?.chapter_count || 0;
  } catch (error) {
    console.error(`Erro ao buscar número de capítulos para o livro ${bookId}:`, error);
    throw new Error('Falha ao carregar o número de capítulos');
  }
}

export async function getChapterVerses(bookId: number, chapter: number, translation: string = 'text_naa') {
  try {
    const { data, error } = await supabase
      .from('verses')
      .select('*')
      .eq('book_id', bookId)
      .eq('chapter', chapter)
      .order('verse');

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return null;
    }

    return {
      bookId,
      bookName: data[0].book_name,
      chapter,
      verses: data.map(verse => ({
        ...verse,
        text: verse[translation] || verse.text_naa
      }))
    };
  } catch (error) {
    console.error(`Erro ao buscar versículos do capítulo ${chapter} do livro ${bookId}:`, error);
    throw new Error('Falha ao carregar os versículos');
  }
}
