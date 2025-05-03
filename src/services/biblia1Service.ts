
import { supabase } from '@/integrations/supabase/client';

export interface Book {
  id: number;
  name: string;
  abbrev: string;
  testament_id: number;
}

export interface Testament {
  id: number;
  name: string;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number | null;
  verse: number | null;
  text: string | null;
  version: string | null;
}

export interface SearchResult extends Verse {
  book_name: string;
  book_abbrev: string;
}

export interface FavoriteItem {
  id: string;
  bookId: number;
  bookName: string;
  bookAbbrev: string;
  chapter: number;
  verse?: number;
  text?: string;
  createdAt: string;
}

export async function getBooks(): Promise<Book[]> {
  console.log('Fetching books');
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching books:', error);
    throw error;
  }

  console.log('Books retrieved:', data?.length);
  return data || [];
}

export async function getTestaments(): Promise<Testament[]> {
  console.log('Fetching testaments');
  const { data, error } = await supabase
    .from('testaments')
    .select('*')
    .order('id');
    
  if (error) {
    console.error('Error fetching testaments:', error);
    throw error;
  }

  console.log('Testaments retrieved:', data?.length);
  return data || [];
}

export async function getBook(bookId: number): Promise<Book | null> {
  console.log('Fetching book with ID:', bookId);
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single();
    
  if (error) {
    console.error('Error fetching book:', error);
    if (error.code === 'PGRST116') {
      // No results found
      return null;
    }
    throw error;
  }

  console.log('Book retrieved:', data?.name);
  return data;
}

export async function getVersesByBook(bookId: number): Promise<Verse[]> {
  console.log('Fetching verses for book ID:', bookId);
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book_id', bookId)
    .order('chapter')
    .order('verse');
    
  if (error) {
    console.error('Error fetching verses:', error);
    throw error;
  }

  console.log('Verses retrieved:', data?.length);
  return data || [];
}

// Nova função para buscar versículos por texto
export async function searchVerses(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 3) {
    return [];
  }

  console.log('Searching verses with query:', query);
  
  // Busca os versículos que contêm o texto de busca
  const { data, error } = await supabase
    .from('verses')
    .select(`
      *,
      books!inner (
        name,
        abbrev
      )
    `)
    .textSearch('text', query, {
      config: 'portuguese'
    })
    .limit(50);
    
  if (error) {
    console.error('Error searching verses:', error);
    throw error;
  }

  console.log('Search results:', data?.length);
  
  // Formata os resultados para incluir informações do livro
  const results: SearchResult[] = (data || []).map(item => ({
    ...item,
    book_name: item.books.name,
    book_abbrev: item.books.abbrev
  }));

  return results;
}

// Melhorada para adicionar testamentos, livros e alguns versículos de exemplo
export async function createInitialData() {
  try {
    // Verificar e popular a tabela de testamentos se estiver vazia
    const { data: testamentsData } = await supabase
      .from('testaments')
      .select('id')
      .limit(1);
      
    if (!testamentsData || testamentsData.length === 0) {
      console.log('Adicionando testamentos iniciais');
      
      const { error: testamentsError } = await supabase.from('testaments').insert([
        { id: 1, name: 'Antigo Testamento' },
        { id: 2, name: 'Novo Testamento' }
      ]);
      
      if (testamentsError) {
        console.error('Erro ao adicionar testamentos:', testamentsError);
        throw testamentsError;
      }
    }
    
    // Verificar e popular a tabela de livros se estiver vazia
    const { data: booksData } = await supabase
      .from('books')
      .select('id')
      .limit(1);
      
    if (!booksData || booksData.length === 0) {
      console.log('Adicionando livros iniciais');
      
      // Array de livros a serem adicionados
      const booksToAdd = [
        // Antigo Testamento
        { id: 1, name: 'Gênesis', abbrev: 'Gn', testament_id: 1 },
        { id: 2, name: 'Êxodo', abbrev: 'Ex', testament_id: 1 },
        { id: 3, name: 'Levítico', abbrev: 'Lv', testament_id: 1 },
        { id: 4, name: 'Números', abbrev: 'Nm', testament_id: 1 },
        { id: 5, name: 'Deuteronômio', abbrev: 'Dt', testament_id: 1 },
        { id: 6, name: 'Josué', abbrev: 'Js', testament_id: 1 },
        { id: 7, name: 'Juízes', abbrev: 'Jz', testament_id: 1 },
        { id: 8, name: 'Rute', abbrev: 'Rt', testament_id: 1 },
        { id: 9, name: '1 Samuel', abbrev: '1Sm', testament_id: 1 },
        { id: 10, name: '2 Samuel', abbrev: '2Sm', testament_id: 1 },
        { id: 11, name: '1 Reis', abbrev: '1Rs', testament_id: 1 },
        { id: 12, name: '2 Reis', abbrev: '2Rs', testament_id: 1 },
        { id: 13, name: '1 Crônicas', abbrev: '1Cr', testament_id: 1 },
        { id: 14, name: '2 Crônicas', abbrev: '2Cr', testament_id: 1 },
        { id: 15, name: 'Esdras', abbrev: 'Ed', testament_id: 1 },
        { id: 16, name: 'Neemias', abbrev: 'Ne', testament_id: 1 },
        { id: 17, name: 'Ester', abbrev: 'Et', testament_id: 1 },
        { id: 18, name: 'Jó', abbrev: 'Jó', testament_id: 1 },
        { id: 19, name: 'Salmos', abbrev: 'Sl', testament_id: 1 },
        { id: 20, name: 'Provérbios', abbrev: 'Pv', testament_id: 1 },
        { id: 21, name: 'Eclesiastes', abbrev: 'Ec', testament_id: 1 },
        { id: 22, name: 'Cânticos', abbrev: 'Ct', testament_id: 1 },
        { id: 23, name: 'Isaías', abbrev: 'Is', testament_id: 1 },
        { id: 24, name: 'Jeremias', abbrev: 'Jr', testament_id: 1 },
        { id: 25, name: 'Lamentações', abbrev: 'Lm', testament_id: 1 },
        { id: 26, name: 'Ezequiel', abbrev: 'Ez', testament_id: 1 },
        { id: 27, name: 'Daniel', abbrev: 'Dn', testament_id: 1 },
        { id: 28, name: 'Oséias', abbrev: 'Os', testament_id: 1 },
        { id: 29, name: 'Joel', abbrev: 'Jl', testament_id: 1 },
        { id: 30, name: 'Amós', abbrev: 'Am', testament_id: 1 },
        { id: 31, name: 'Obadias', abbrev: 'Ob', testament_id: 1 },
        { id: 32, name: 'Jonas', abbrev: 'Jn', testament_id: 1 },
        { id: 33, name: 'Miquéias', abbrev: 'Mq', testament_id: 1 },
        { id: 34, name: 'Naum', abbrev: 'Na', testament_id: 1 },
        { id: 35, name: 'Habacuque', abbrev: 'Hc', testament_id: 1 },
        { id: 36, name: 'Sofonias', abbrev: 'Sf', testament_id: 1 },
        { id: 37, name: 'Ageu', abbrev: 'Ag', testament_id: 1 },
        { id: 38, name: 'Zacarias', abbrev: 'Zc', testament_id: 1 },
        { id: 39, name: 'Malaquias', abbrev: 'Ml', testament_id: 1 },
        // Novo Testamento
        { id: 40, name: 'Mateus', abbrev: 'Mt', testament_id: 2 },
        { id: 41, name: 'Marcos', abbrev: 'Mc', testament_id: 2 },
        { id: 42, name: 'Lucas', abbrev: 'Lc', testament_id: 2 },
        { id: 43, name: 'João', abbrev: 'Jo', testament_id: 2 },
        { id: 44, name: 'Atos', abbrev: 'At', testament_id: 2 },
        { id: 45, name: 'Romanos', abbrev: 'Rm', testament_id: 2 },
        { id: 46, name: '1 Coríntios', abbrev: '1Co', testament_id: 2 },
        { id: 47, name: '2 Coríntios', abbrev: '2Co', testament_id: 2 },
        { id: 48, name: 'Gálatas', abbrev: 'Gl', testament_id: 2 },
        { id: 49, name: 'Efésios', abbrev: 'Ef', testament_id: 2 },
        { id: 50, name: 'Filipenses', abbrev: 'Fp', testament_id: 2 },
        { id: 51, name: 'Colossenses', abbrev: 'Cl', testament_id: 2 },
        { id: 52, name: '1 Tessalonicenses', abbrev: '1Ts', testament_id: 2 },
        { id: 53, name: '2 Tessalonicenses', abbrev: '2Ts', testament_id: 2 },
        { id: 54, name: '1 Timóteo', abbrev: '1Tm', testament_id: 2 },
        { id: 55, name: '2 Timóteo', abbrev: '2Tm', testament_id: 2 },
        { id: 56, name: 'Tito', abbrev: 'Tt', testament_id: 2 },
        { id: 57, name: 'Filemom', abbrev: 'Fm', testament_id: 2 },
        { id: 58, name: 'Hebreus', abbrev: 'Hb', testament_id: 2 },
        { id: 59, name: 'Tiago', abbrev: 'Tg', testament_id: 2 },
        { id: 60, name: '1 Pedro', abbrev: '1Pe', testament_id: 2 },
        { id: 61, name: '2 Pedro', abbrev: '2Pe', testament_id: 2 },
        { id: 62, name: '1 João', abbrev: '1Jo', testament_id: 2 },
        { id: 63, name: '2 João', abbrev: '2Jo', testament_id: 2 },
        { id: 64, name: '3 João', abbrev: '3Jo', testament_id: 2 },
        { id: 65, name: 'Judas', abbrev: 'Jd', testament_id: 2 },
        { id: 66, name: 'Apocalipse', abbrev: 'Ap', testament_id: 2 }
      ];
      
      // Insere os livros em lotes para evitar problemas com tamanho da requisição
      const batchSize = 20;
      for (let i = 0; i < booksToAdd.length; i += batchSize) {
        const batchBooks = booksToAdd.slice(i, i + batchSize);
        const { error: booksError } = await supabase.from('books').insert(batchBooks);
        
        if (booksError) {
          console.error(`Erro ao adicionar livros (lote ${i/batchSize + 1}):`, booksError);
          throw booksError;
        }
      }
    }
    
    // Verificar e adicionar alguns versículos de exemplo se a tabela estiver vazia
    const { data: versesData } = await supabase
      .from('verses')
      .select('id')
      .limit(1);
      
    if (!versesData || versesData.length === 0) {
      console.log('Adicionando versículos de exemplo');
      
      // Exemplos de versículos de Gênesis 1
      const exampleVerses = [
        { id: 1, book_id: 1, chapter: 1, verse: 1, text: "No princípio, Deus criou os céus e a terra.", version: "NVI" },
        { id: 2, book_id: 1, chapter: 1, verse: 2, text: "Era a terra sem forma e vazia; trevas cobriam a face do abismo, e o Espírito de Deus se movia sobre a face das águas.", version: "NVI" },
        { id: 3, book_id: 1, chapter: 1, verse: 3, text: "Disse Deus: \"Haja luz\", e houve luz.", version: "NVI" },
        { id: 4, book_id: 1, chapter: 1, verse: 4, text: "Deus viu que a luz era boa, e separou a luz das trevas.", version: "NVI" },
        { id: 5, book_id: 1, chapter: 1, verse: 5, text: "Deus chamou à luz dia, e às trevas chamou noite. Passaram-se a tarde e a manhã; esse foi o primeiro dia.", version: "NVI" }
      ];
      
      const { error: versesError } = await supabase.from('verses').insert(exampleVerses);
      
      if (versesError) {
        console.error('Erro ao adicionar versículos de exemplo:', versesError);
        throw versesError;
      }
      
      // Exemplos de versículos de João 3:16
      const moreVerses = [
        { id: 6, book_id: 43, chapter: 3, verse: 16, text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", version: "NVI" },
        { id: 7, book_id: 43, chapter: 3, verse: 17, text: "Porque Deus enviou o seu Filho ao mundo não para que condenasse o mundo, mas para que o mundo fosse salvo por ele.", version: "NVI" }
      ];
      
      const { error: moreVersesError } = await supabase.from('verses').insert(moreVerses);
      
      if (moreVersesError) {
        console.error('Erro ao adicionar mais versículos de exemplo:', moreVersesError);
        throw moreVersesError;
      }
    }
    
    console.log('Inicialização de dados concluída com sucesso');
    return true;
  } catch (error) {
    console.error('Erro durante a inicialização dos dados:', error);
    throw error;
  }
}
