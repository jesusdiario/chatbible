
export interface BibleBook {
  slug: string;
  title: string;
  image_url: string | null;
  category_slug: string;
  display_order: number;
  abbrev?: string;
  id?: number;
  testament_id?: number;
  name?: string;
}

export interface BibleCategory {
  slug: string;
  title: string;
  description?: string;
  display_order: number;
}

export interface Testament {
  id: number;
  name: string;
  books: BibleBook[];
}

export interface Suggestion {
  id: string;
  book_slug: string;
  label: string;
  user_message: string;
  prompt_override?: string;
  icon?: string;
  description?: string;
  display_order: number;
}
