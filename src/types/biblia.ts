
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
  version: string | null;
  abbrev?: string;
  book_name?: string;
  book_slug?: string;
}

