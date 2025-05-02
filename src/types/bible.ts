
export interface BibleBook {
  slug: string;
  title: string;
  image_url: string | null;
  category_slug: string;
  display_order: number;
}

export interface Testament {
  slug: string;
  title: string;
}

export interface BibleCategory {
  slug: string;
  title: string;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

export interface BibleReference {
  book: string;
  chapter: number;
  verse?: number;
}
