
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/biblia';
import { toNumber } from '@/utils/bibliaUtils';

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
          chaptersCount: 0 // Será preenchido na próxima consulta
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
      .select('book_id, chapter, book_name, abbrev, book_slug')
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
    const bookSlug = data[0].book_slug || '';
    
    // Contar capítulos únicos
    const chapterValues = data.map(v => v.chapter).filter(Boolean);
    const uniqueChapters = [...new Set(chapterValues)];
    
    return {
      id: String(bookIdNum),
      name: bookName,
      abbrev,
      slug: bookSlug,
      chaptersCount: uniqueChapters.length
    };
  } catch (error) {
    console.error(`Erro ao buscar livro ${bookId}:`, error);
    throw error;
  }
}
