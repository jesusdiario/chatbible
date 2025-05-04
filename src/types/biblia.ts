
export interface BibleBook {
  slug: string;
  title: string;
  image_url: string | null;
  category_slug: string;
  display_order: number;
  
  // Campos da tabela "books"
  id?: number;
  name?: string;
  abbrev?: string;
  testament_id?: number;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number | null;
  verse: number | null;
  text: string | null;
  version?: string | null;
  abbrev?: string;
  book_name?: string;
  book_slug?: string;
  text_nvi?: string | null;
  text_acf?: string | null;
  text_ara?: string | null;
  text_arc?: string | null;
  text_naa?: string | null;
  text_ntlh?: string | null;
  text_nvt?: string | null;
  [key: string]: any; // Para permitir acesso dinâmico à tradução pelo nome
}
