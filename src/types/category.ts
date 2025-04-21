
export interface Category {
  id: string;
  title: string;
  slug: string;
  display_order: number;
  page_slug: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}
