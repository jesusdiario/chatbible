
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
