
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
