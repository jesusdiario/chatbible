
export interface Book {
  id: number;
  name: string;
  abbrev: string;
  testament_id: number;
}

export interface Verse {
  id: number;
  book_id: number;
  chapter: number;
  verse: number;
  text: string;
  version?: string;
}

export interface VerseWithReference extends Verse {
  bookName: string;
  bookAbbrev: string;
}

export interface Chapter {
  number: number;
}

// Additional types needed for the Bible feature
export interface BibleBook {
  id: number;
  title: string;
  slug: string;
  category_slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
}

export interface BibleCategory {
  id: number;
  title: string;
  slug: string;
  description?: string;
  display_order: number;
}

export interface Suggestion {
  id: number;
  text: string;
  book_slug: string;
  type: string;
}
