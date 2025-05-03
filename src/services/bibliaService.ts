
import { supabase } from '@/integrations/supabase/client';

export interface Verse {
  id: number;
  book_id: string | null;
  chapter: number | null;
  verse: number | null;
  text_acf: string | null;
  text_ara: string | null;
  text_arc: string | null;
  text_naa: string | null;
  text_ntlh: string | null;
  text_nvi: string | null;
  text_nvt: string | null;
}

export interface Book {
  id: string;
  name: string;
  abbrev: string;
  chaptersCount: number;
  testament: string;
}

export type BibleVersion = 'acf' | 'ara' | 'arc' | 'naa' | 'ntlh' | 'nvi' | 'nvt';

// Função para obter a lista de todos os livros disponíveis
export async function getBooks(): Promise<Book[]> {
  try {
    // Consultar os livros disponíveis a partir dos dados de versículos
    const { data, error } = await supabase
      .from('verses')
      .select('book_id')
      .not('book_id', 'is', null);
      
    if (error) {
      console.error('Erro ao buscar livros:', error);
      throw error;
    }

    // Extrair livros únicos
    const bookIds = data.map(v => v.book_id).filter(Boolean);
    const uniqueBookIds = [...new Set(bookIds)];

    // Informações dos livros (mapear IDs para nomes completos)
    const booksInfo = uniqueBookIds.map(bookId => {
      const [testament, abbrev] = String(bookId).split('.');
      let name = getBookNameByAbbrev(abbrev || '');
      
      return {
        id: String(bookId),
        name,
        abbrev: abbrev || '',
        chaptersCount: 0, // Será preenchido na próxima consulta
        testament: testament === 'vt' ? 'Antigo Testamento' : 'Novo Testamento'
      };
    });

    // Para cada livro, contar quantos capítulos existem
    for (const book of booksInfo) {
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('verses')
        .select('chapter')
        .eq('book_id', book.id);
        
      if (chaptersError) {
        console.error(`Erro ao contar capítulos para ${book.name}:`, chaptersError);
        continue;
      }
      
      const chapterValues = chaptersData.map(v => v.chapter).filter(Boolean);
      const uniqueChapters = [...new Set(chapterValues)];
      book.chaptersCount = uniqueChapters.length;
    }

    return booksInfo;
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    throw error;
  }
}

// Função para obter os versículos de um livro e capítulo específicos
export async function getVersesByBookChapter(bookId: string, chapter: string, version: BibleVersion = 'acf'): Promise<Verse[]> {
  const chapterNum = parseInt(chapter, 10);
  
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', bookId)
    .eq('chapter', chapterNum);
    
  if (error) {
    console.error(`Erro ao buscar versículos para ${bookId} capítulo ${chapter}:`, error);
    throw error;
  }

  return data as Verse[];
}

// Função para obter os testamentos
export async function getTestaments(): Promise<{id: string, name: string}[]> {
  try {
    // Consultar os testamentos disponíveis a partir dos dados de versículos
    const { data, error } = await supabase
      .from('verses')
      .select('book_id')
      .not('book_id', 'is', null);
      
    if (error) {
      console.error('Erro ao buscar testamentos:', error);
      throw error;
    }

    // Extrair o prefixo do testamento (vt ou nt)
    const testamentPrefixes = data
      .map(verse => verse.book_id ? String(verse.book_id).split('.')[0] : null)
      .filter(Boolean);
    
    const uniqueTestaments = [...new Set(testamentPrefixes)];

    return uniqueTestaments.map(t => ({
      id: String(t),
      name: t === 'vt' ? 'Antigo Testamento' : 'Novo Testamento'
    }));
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

// Função auxiliar para obter o nome do livro pelo seu código
function getBookNameByAbbrev(abbrev: string): string {
  const booksMap: Record<string, string> = {
    'gn': 'Gênesis',
    'ex': 'Êxodo',
    'lv': 'Levítico',
    'nm': 'Números',
    'dt': 'Deuteronômio',
    'js': 'Josué',
    'jz': 'Juízes',
    'rt': 'Rute',
    '1sm': '1 Samuel',
    '2sm': '2 Samuel',
    '1rs': '1 Reis',
    '2rs': '2 Reis',
    '1cr': '1 Crônicas',
    '2cr': '2 Crônicas',
    'ed': 'Esdras',
    'ne': 'Neemias',
    'et': 'Ester',
    'jó': 'Jó',
    'sl': 'Salmos',
    'pv': 'Provérbios',
    'ec': 'Eclesiastes',
    'ct': 'Cânticos',
    'is': 'Isaías',
    'jr': 'Jeremias',
    'lm': 'Lamentações',
    'ez': 'Ezequiel',
    'dn': 'Daniel',
    'os': 'Oséias',
    'jl': 'Joel',
    'am': 'Amós',
    'ob': 'Obadias',
    'jn': 'Jonas',
    'mq': 'Miquéias',
    'na': 'Naum',
    'hc': 'Habacuque',
    'sf': 'Sofonias',
    'ag': 'Ageu',
    'zc': 'Zacarias',
    'ml': 'Malaquias',
    'mt': 'Mateus',
    'mc': 'Marcos',
    'lc': 'Lucas',
    'jo': 'João',
    'at': 'Atos',
    'rm': 'Romanos',
    '1co': '1 Coríntios',
    '2co': '2 Coríntios',
    'gl': 'Gálatas',
    'ef': 'Efésios',
    'fp': 'Filipenses',
    'cl': 'Colossenses',
    '1ts': '1 Tessalonicenses',
    '2ts': '2 Tessalonicenses',
    '1tm': '1 Timóteo',
    '2tm': '2 Timóteo',
    'tt': 'Tito',
    'fm': 'Filemom',
    'hb': 'Hebreus',
    'tg': 'Tiago',
    '1pe': '1 Pedro',
    '2pe': '2 Pedro',
    '1jo': '1 João',
    '2jo': '2 João',
    '3jo': '3 João',
    'jd': 'Judas',
    'ap': 'Apocalipse',
  };
  
  return booksMap[abbrev.toLowerCase()] || abbrev;
}

// Função para obter detalhes de um livro específico
export async function getBook(bookId: string): Promise<Book | null> {
  try {
    // Verificar se o livro existe obtendo seus dados
    const { data, error } = await supabase
      .from('verses')
      .select('book_id, chapter')
      .eq('book_id', bookId)
      .not('chapter', 'is', null);
      
    if (error) {
      console.error(`Erro ao buscar informações do livro ${bookId}:`, error);
      throw error;
    }

    if (data.length === 0) {
      return null;
    }
    
    const [testament, abbrev] = String(bookId).split('.');
    const name = getBookNameByAbbrev(abbrev || '');
    
    // Contar capítulos únicos
    const chapterValues = data.map(v => v.chapter).filter(Boolean);
    const uniqueChapters = [...new Set(chapterValues)];
    
    return {
      id: bookId,
      name,
      abbrev,
      chaptersCount: uniqueChapters.length,
      testament: testament === 'vt' ? 'Antigo Testamento' : 'Novo Testamento'
    };
  } catch (error) {
    console.error(`Erro ao buscar livro ${bookId}:`, error);
    throw error;
  }
}
