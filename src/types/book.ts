
export type BookCategory = "pentateuco" | "historico" | "poetico" | "profetico" | "novo_testamento" | "outro";

export interface Book {
  id: string;
  title: string;
  slug: string;
  book_category: BookCategory;
  image_url?: string;
}

export type BookFormData = Omit<Book, "id">;
