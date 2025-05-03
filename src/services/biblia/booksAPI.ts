
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/biblia';
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
