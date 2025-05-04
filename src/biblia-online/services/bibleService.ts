
import { supabase } from '@/integrations/supabase/client';

// Interface para os livros da Bíblia
export interface Book {
  id: number;
  name: string;
  abbrev: string;
  slug: string;
  chapter_count: number;
  book_name?: string;
}

// Interface para versículos
export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text_nvi?: string;
  text_acf?: string;
  text_ara?: string;
  text_arc?: string;
  text_naa?: string;
  text_ntlh?: string;
  text_nvt?: string;
  abbrev?: string;
  book_name?: string;
  book_slug?: string;
  [key: string]: any; // Allow dynamic access to translation fields
}

// Interface para capítulo
export interface Chapter {
  book_id: number;
  book_name: string;
  book_slug: string;
  chapter: number;
  verses: Verse[];
}

// Enum para traduções
export enum BibleTranslation {
  NVI = 'text_nvi',
  ACF = 'text_acf',
  ARA = 'text_ara',
  ARC = 'text_arc',
  NAA = 'text_naa',
  NTLH = 'text_ntlh',
  NVT = 'text_nvt',
  Default = 'text_naa' // Usando NAA como padrão
}

// Serviço da Bíblia
export const BibleService = {
  // Buscar todos os livros
  getBooks: async (): Promise<Book[]> => {
    try {
      console.log('BibleService: Fetching books from Supabase...');
      const { data, error } = await supabase
        .from('books_mv')
        .select('*')
        .order('id');

      if (error) {
        console.error('BibleService Error (getBooks):', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('BibleService: No books found');
        return [];
      }
      
      console.log('BibleService: Fetched', data.length, 'books');
      return data.map(book => ({
        id: book.id,
        name: book.name,
        abbrev: book.abbrev,
        slug: book.slug,
        chapter_count: book.chapter_count,
        book_name: book.name
      }));
    } catch (error) {
      console.error('BibleService Error (getBooks):', error);
      throw new Error('Falha ao carregar a lista de livros');
    }
  },

  // Buscar livro por slug
  getBookBySlug: async (slug: string): Promise<Book | null> => {
    try {
      console.log(`BibleService: Fetching book with slug ${slug}...`);
      const { data, error } = await supabase
        .from('books_mv')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn(`BibleService: No book found with slug ${slug}`);
          return null; // No rows found
        }
        console.error(`BibleService Error (getBookBySlug - ${slug}):`, error);
        throw error;
      }
      
      if (!data) {
        console.warn(`BibleService: No book found with slug ${slug}`);
        return null;
      }
      
      console.log('BibleService: Found book with slug', slug);
      return {
        id: data.id,
        name: data.name,
        abbrev: data.abbrev,
        slug: data.slug,
        chapter_count: data.chapter_count,
        book_name: data.name
      };
    } catch (error) {
      console.error(`BibleService Error (getBookBySlug - ${slug}):`, error);
      throw new Error(`Falha ao carregar o livro com slug ${slug}`);
    }
  },

  // Buscar capítulo específico
  getChapter: async (bookId: number, chapter: number): Promise<Chapter | null> => {
    try {
      console.log(`BibleService: Fetching chapter ${chapter} from book ID ${bookId}...`);
      // Obter versículos para o capítulo
      const { data: verses, error: versesError } = await supabase
        .from('verses')
        .select('*')
        .eq('book_id', bookId)
        .eq('chapter', chapter)
        .order('verse');

      if (versesError) {
        console.error(`BibleService Error (getChapter - book: ${bookId}, chapter: ${chapter}):`, versesError);
        throw versesError;
      }

      if (!verses || verses.length === 0) {
        console.warn(`BibleService: No verses found for book ${bookId}, chapter ${chapter}`);
        return null;
      }

      console.log(`BibleService: Fetched ${verses.length} verses for chapter ${chapter}`);

      // Obter nome do livro do primeiro versículo
      const bookName = verses[0].book_name || '';
      const bookSlug = verses[0].book_slug || '';

      return {
        book_id: bookId,
        book_name: bookName,
        book_slug: bookSlug,
        chapter: chapter,
        verses: verses
      };
    } catch (error) {
      console.error(`BibleService Error (getChapter - book: ${bookId}, chapter: ${chapter}):`, error);
      throw new Error(`Falha ao carregar o capítulo ${chapter}`);
    }
  },
  
  // Obter capítulo por slug
  getChapterBySlug: async (slug: string, chapter: number): Promise<Chapter | null> => {
    try {
      console.log(`BibleService: Fetching chapter ${chapter} from book with slug ${slug}...`);
      // Primeiro, obter o livro pelo slug
      const book = await BibleService.getBookBySlug(slug);
      if (!book) {
        console.warn(`BibleService: Book with slug ${slug} not found`);
        return null;
      }
      
      console.log(`BibleService: Found book ${book.name} (ID: ${book.id}), getting chapter ${chapter}...`);
      // Usar o ID do livro para obter o capítulo
      return await BibleService.getChapter(book.id, chapter);
    } catch (error) {
      console.error(`BibleService Error (getChapterBySlug - slug: ${slug}, chapter: ${chapter}):`, error);
      throw new Error(`Falha ao carregar o capítulo ${chapter} do livro ${slug}`);
    }
  },
  
  // Obter contagem de capítulos para um livro
  getChapterCount: async (bookId: number): Promise<number> => {
    try {
      console.log(`BibleService: Getting chapter count for book ID ${bookId}...`);
      const { data, error } = await supabase
        .from('books_mv')
        .select('chapter_count')
        .eq('id', bookId)
        .single();

      if (error) {
        console.error(`BibleService Error (getChapterCount - book: ${bookId}):`, error);
        throw error;
      }
      
      console.log(`BibleService: Book ID ${bookId} has ${data?.chapter_count || 0} chapters`);
      return data ? data.chapter_count : 0;
    } catch (error) {
      console.error(`BibleService Error (getChapterCount - book: ${bookId}):`, error);
      throw new Error('Falha ao determinar o número de capítulos');
    }
  }
};
