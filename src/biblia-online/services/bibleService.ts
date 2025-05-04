
import { supabase } from '@/integrations/supabase/client';

// Interface para os livros da Bíblia
export interface Book {
  id: number;
  name: string;
  abbrev: string;
  slug: string;
  chapter_count: number;
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
      console.log('Buscando livros...');
      const { data, error } = await supabase
        .from('books_mv')
        .select('*')
        .order('id');

      if (error) {
        console.error('Erro na busca de livros:', error);
        throw error;
      }
      
      console.log(`Encontrados ${data?.length || 0} livros`);
      if (!data || data.length === 0) return [];
      
      return data.map(book => ({
        id: book.id,
        name: book.name,
        abbrev: book.abbrev,
        slug: book.slug,
        chapter_count: book.chapter_count
      }));
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      throw new Error('Falha ao carregar a lista de livros');
    }
  },

  // Buscar livro por slug
  getBookBySlug: async (slug: string): Promise<Book | null> => {
    try {
      console.log(`Buscando livro pelo slug: ${slug}`);
      const { data, error } = await supabase
        .from('books_mv')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`Nenhum livro encontrado com o slug: ${slug}`);
          return null; // No rows found
        }
        console.error(`Erro na busca do livro pelo slug ${slug}:`, error);
        throw error;
      }
      
      if (!data) return null;
      
      console.log(`Livro encontrado: ${data.name}`);
      return {
        id: data.id,
        name: data.name,
        abbrev: data.abbrev,
        slug: data.slug,
        chapter_count: data.chapter_count
      };
    } catch (error) {
      console.error(`Erro ao buscar livro pelo slug ${slug}:`, error);
      throw new Error(`Falha ao carregar o livro com slug ${slug}`);
    }
  },

  // Buscar capítulo específico
  getChapter: async (bookId: number, chapter: number): Promise<Chapter | null> => {
    try {
      console.log(`Buscando capítulo ${chapter} do livro ID ${bookId}...`);
      // Obter versículos para o capítulo
      const { data: verses, error: versesError } = await supabase
        .from('verses')
        .select('*')
        .eq('book_id', bookId)
        .eq('chapter', chapter)
        .order('verse');

      if (versesError) {
        console.error(`Erro na busca de versículos para livro ID ${bookId}, capítulo ${chapter}:`, versesError);
        throw versesError;
      }

      console.log(`Versículos encontrados: ${verses?.length || 0}`);
      if (!verses || verses.length === 0) {
        console.log(`Nenhum versículo encontrado para o livro ID ${bookId}, capítulo ${chapter}`);
        return null;
      }

      // Obter nome do livro do primeiro versículo
      const bookName = verses[0].book_name || '';
      const bookSlug = verses[0].book_slug || '';

      console.log(`Capítulo montado: ${bookName} ${chapter} com ${verses.length} versículos`);
      return {
        book_id: bookId,
        book_name: bookName,
        book_slug: bookSlug,
        chapter: chapter,
        verses: verses
      };
    } catch (error) {
      console.error(`Erro ao buscar capítulo ${chapter} para o livro ${bookId}:`, error);
      throw new Error(`Falha ao carregar o capítulo ${chapter}`);
    }
  },
  
  // Obter capítulo por slug
  getChapterBySlug: async (slug: string, chapter: number): Promise<Chapter | null> => {
    try {
      console.log(`Buscando capítulo ${chapter} do livro com slug ${slug}...`);
      // Primeiro, obter o livro pelo slug
      const book = await BibleService.getBookBySlug(slug);
      if (!book) {
        console.log(`Livro não encontrado com o slug: ${slug}`);
        return null;
      }
      
      // Usar o ID do livro para obter o capítulo
      console.log(`Obtendo o capítulo usando o ID do livro: ${book.id}`);
      return await BibleService.getChapter(book.id, chapter);
    } catch (error) {
      console.error(`Erro ao buscar capítulo ${chapter} para o livro com slug ${slug}:`, error);
      throw new Error(`Falha ao carregar o capítulo ${chapter} do livro ${slug}`);
    }
  },
  
  // Obter contagem de capítulos para um livro
  getChapterCount: async (bookId: number): Promise<number> => {
    try {
      console.log(`Buscando contagem de capítulos para o livro ID ${bookId}...`);
      const { data, error } = await supabase
        .from('books_mv')
        .select('chapter_count')
        .eq('id', bookId)
        .single();

      if (error) {
        console.error(`Erro na busca de contagem de capítulos para o livro ID ${bookId}:`, error);
        throw error;
      }
      
      console.log(`Contagem de capítulos para o livro ID ${bookId}: ${data?.chapter_count || 0}`);
      return data ? data.chapter_count : 0;
    } catch (error) {
      console.error(`Erro ao buscar contagem de capítulos para o livro ${bookId}:`, error);
      throw new Error('Falha ao determinar o número de capítulos');
    }
  }
};
