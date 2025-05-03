
import { supabase } from '@/integrations/supabase/client';
import { Verse, Book, Testament, BibleVersion } from '@/types/biblia';
import { parseBookInfo, toNumber } from '@/utils/bibliaUtils';

// Função para obter a lista de todos os livros disponíveis
export async function getBooks(): Promise<Book[]> {
  try {
    console.log("Fetching books...");
    // Consultar os livros disponíveis a partir dos dados de versículos
    const { data, error } = await supabase
      .from('verses')
      .select('book_id, book_name, abbrev, book_slug')
      .not('book_id', 'is', null)
      .order('book_id', { ascending: true });
      
    if (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    }

    // Extrair livros únicos
    const bookMap = new Map();
    
    data.forEach(verse => {
      if (verse.book_id && !bookMap.has(verse.book_id)) {
        const bookAbbrev = verse.abbrev || '';
        const bookName = verse.book_name || '';
        const bookSlug = verse.book_slug || '';
        
        bookMap.set(verse.book_id, {
          id: String(verse.book_id),
          name: bookName,
          abbrev: bookAbbrev,
          slug: bookSlug,
          chaptersCount: 0, // Será preenchido na próxima consulta
          testament: verse.book_id < 40 ? 'Antigo Testamento' : 'Novo Testamento'
        });
      }
    });

    const booksInfo = Array.from(bookMap.values());
    console.log(`Found ${booksInfo.length} unique books`);
    console.log("Books data sample:", booksInfo.slice(0, 3));

    // Para cada livro, contar quantos capítulos existem
    const booksWithChapters = [];
    for (const book of booksInfo) {
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('verses')
        .select('chapter')
        .eq('book_id', Number(book.id))
        .order('chapter', { ascending: true });
        
      if (chaptersError) {
        console.error(`Erro ao contar capítulos para ${book.name}:`, chaptersError);
        continue;
      }
      
      const chapterValues = chaptersData.map(v => v.chapter).filter(Boolean);
      const uniqueChapters = [...new Set(chapterValues)];
      const bookWithChapters = {
        ...book,
        chaptersCount: uniqueChapters.length
      };
      booksWithChapters.push(bookWithChapters);
    }

    return booksWithChapters;
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

// Função para obter os testamentos
export async function getTestaments(): Promise<Testament[]> {
  try {
    // Consultar os livros disponíveis
    const { data, error } = await supabase
      .from('verses')
      .select('book_id')
      .not('book_id', 'is', null);
      
    if (error) {
      console.error('Erro ao buscar testamentos:', error);
      throw error;
    }

    // Determinar testamentos baseando-se nos IDs dos livros
    const hasOldTestament = data.some(v => v.book_id < 40);
    const hasNewTestament = data.some(v => v.book_id >= 40);
    
    const testaments: Testament[] = [];
    
    if (hasOldTestament) {
      testaments.push({
        id: 'vt',
        name: 'Antigo Testamento'
      });
    }
    
    if (hasNewTestament) {
      testaments.push({
        id: 'nt',
        name: 'Novo Testamento'
      });
    }

    return testaments;
  } catch (error) {
    console.error('Erro ao buscar testamentos:', error);
    throw error;
  }
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
    
    // Verificar se o livro existe obtendo seus dados
    const { data, error } = await supabase
      .from('verses')
      .select('book_id, chapter, book_name, abbrev')
      .eq('book_id', bookIdNum)
      .not('chapter', 'is', null);
      
    if (error) {
      console.error(`Erro ao buscar informações do livro ${bookIdNum}:`, error);
      throw error;
    }

    if (data.length === 0) {
      return null;
    }
    
    const bookName = data[0].book_name || '';
    const abbrev = data[0].abbrev || '';
    
    // Contar capítulos únicos
    const chapterValues = data.map(v => v.chapter).filter(Boolean);
    const uniqueChapters = [...new Set(chapterValues)];
    
    return {
      id: String(bookIdNum),
      name: bookName,
      abbrev,
      chaptersCount: uniqueChapters.length,
      testament: bookIdNum < 40 ? 'Antigo Testamento' : 'Novo Testamento'
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
