
// Tipos compartilhados para o módulo biblia-online
export interface UserPreferences {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  translation: string;
  theme: 'light' | 'dark' | 'sepia';
  showVerseNumbers: boolean;
}

export interface BibleBookmark {
  id: string;
  bookId: number;
  bookName: string;
  chapter: number;
  verse?: number;
  text?: string;
  note?: string;
  dateCreated: Date;
}

export interface BibleHighlight {
  id: string;
  bookId: number;
  chapter: number;
  verse: number;
  text: string;
  color: string;
  dateCreated: Date;
}
