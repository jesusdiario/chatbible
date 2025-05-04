
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
  chapter: number | null;
  verse: number | null;
  text: string | null;
  text_nvi?: string | null;
  text_acf?: string | null;
  text_ara?: string | null;
  text_arc?: string | null;
  text_naa?: string | null;
  text_ntlh?: string | null;
  text_nvt?: string | null;
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
      const { data, error } = await supabase
        .from('books_mv')
        .select('*')
        .order('id');

      if (error) throw error;
      
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
      const { data, error } = await supabase
        .from('books_mv')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      
      if (!data) return null;
      
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
      // Obter versículos para o capítulo
      const { data: verses, error: versesError } = await supabase
        .from('verses')
        .select('*')
        .eq('book_id', bookId)
        .eq('chapter', chapter)
        .order('verse');

      if (versesError) throw versesError;

      if (!verses || verses.length === 0) {
        return null;
      }

      // Obter nome do livro do primeiro versículo
      const bookName = verses[0].book_name || '';
      const bookSlug = verses[0].book_slug || '';

      // Map verses and ensure 'text' property is set
      const versesWithText = verses.map(verse => ({
        ...verse,
        // Set 'text' to the default translation or first available text
        text: verse.text_naa || verse.text_nvi || verse.text_acf || verse.text_ara || verse.text_arc || verse.text_ntlh || verse.text_nvt || ''
      }));

      console.log("Verses from getChapter:", versesWithText.length, versesWithText[0]);

      return {
        book_id: bookId,
        book_name: bookName,
        book_slug: bookSlug,
        chapter: chapter,
        verses: versesWithText
      };
    } catch (error) {
      console.error(`Erro ao buscar capítulo ${chapter} para o livro ${bookId}:`, error);
      throw new Error(`Falha ao carregar o capítulo ${chapter}`);
    }
  },
  
  // Obter capítulo por slug
  getChapterBySlug: async (slug: string, chapter: number): Promise<Chapter | null> => {
    try {
      // Primeiro, obter o livro pelo slug
      const book = await BibleService.getBookBySlug(slug);
      if (!book) return null;
      
      // Usar o ID do livro para obter o capítulo
      return await BibleService.getChapter(book.id, chapter);
    } catch (error) {
      console.error(`Erro ao buscar capítulo ${chapter} para o livro com slug ${slug}:`, error);
      throw new Error(`Falha ao carregar o capítulo ${chapter} do livro ${slug}`);
    }
  },
  
  // Obter contagem de capítulos para um livro
  getChapterCount: async (bookId: number): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('books_mv')
        .select('chapter_count')
        .eq('id', bookId)
        .single();

      if (error) throw error;
      return data ? data.chapter_count : 0;
    } catch (error) {
      console.error(`Erro ao buscar contagem de capítulos para o livro ${bookId}:`, error);
      throw new Error('Falha ao determinar o número de capítulos');
    }
  }
};
