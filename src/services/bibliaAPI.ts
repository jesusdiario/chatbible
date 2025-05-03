
import { supabase } from '@/integrations/supabase/client';
import { Verse, Book, BibleVersion } from '@/types/biblia';
import { toNumber } from '@/utils/bibliaUtils';

// Função para obter a lista de todos os livros disponíveis
export async function getBooks(): Promise<Book[]> {
  try {
    console.log("Fetching books from materialized view...");
    
    // Consultar os livros da view materializada
    const { data, error } = await supabase
      .from('books_mv')
      .select('*')
      .order('id', { ascending: true });
      
    if (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    }

    // Mapear os resultados para o formato Book
    const books: Book[] = data.map(book => ({
      id: String(book.id),
      name: book.name || '',
      abbrev: book.abbrev || '',
      slug: book.slug || '',
      chaptersCount: book.chapter_count || 0
    }));

    console.log(`Found ${books.length} books from materialized view`);
    return books;
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    throw error;
  }
}

// Função para obter os versículos de um livro e capítulo específicos
export async function getVersesByBookChapter(
  bookId: string | number, 
  chapter: string | number, 
  version: BibleVersion = 'acf'
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

// Função para obter detalhes de um livro específico
export async function getBook(bookId: string | number): Promise<Book | null> {
  try {
    const bookIdNum = toNumber(bookId);
    
    if (bookIdNum === undefined) {
      throw new Error('Book ID deve ser um número válido');
    }
    
    // Verificar se o livro existe usando a view materializada
    const { data, error } = await supabase
      .from('books_mv')
      .select('*')
      .eq('id', bookIdNum)
      .single();
      
    if (error) {
      console.error(`Erro ao buscar informações do livro ${bookIdNum}:`, error);
      throw error;
    }

    if (!data) {
      return null;
    }
    
    return {
      id: String(data.id),
      name: data.name || '',
      abbrev: data.abbrev || '',
      slug: data.slug || '',
      chaptersCount: data.chapter_count || 0
    };
  } catch (error) {
    console.error(`Erro ao buscar livro ${bookId}:`, error);
    throw error;
  }
}

// Função para obter um versículo específico
export async function getVerse(
  bookId: string | number,
  chapter: string | number,
  verse: string | number,
  version: BibleVersion = 'acf'
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
