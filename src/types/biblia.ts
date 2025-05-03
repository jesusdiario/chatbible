
// Tipos para os dados da Bíblia
export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text_acf: string | null;
  text_ara: string | null;
  text_arc: string | null;
  text_naa: string | null;
  text_ntlh: string | null;
  text_nvi: string | null;
  text_nvt: string | null;
  abbrev?: string;
  book_name?: string;
  book_slug?: string;
}

export interface Book {
  id: string;
  name: string;
  abbrev: string;
  slug?: string;
  chaptersCount: number;
}

export type BibleVersion = 'acf' | 'ara' | 'arc' | 'naa' | 'ntlh' | 'nvi' | 'nvt';

// Mapeamento das versões para nomes completos
export const BIBLE_VERSIONS = {
  naa: 'Nova Almeida Atualizada',
  nvi: 'Nova Versão Internacional',
  acf: 'Almeida Corrigida Fiel',
  ara: 'Almeida Revista e Atualizada',
  arc: 'Almeida Revista e Corrigida',
  ntlh: 'Nova Tradução na Linguagem de Hoje',
  nvt: 'Nova Versão Transformadora'
};

// Versão padrão da Bíblia
export const DEFAULT_BIBLE_VERSION: BibleVersion = 'naa';
