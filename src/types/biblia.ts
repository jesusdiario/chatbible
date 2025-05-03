
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
