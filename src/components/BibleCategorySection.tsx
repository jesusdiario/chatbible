
import React from "react";
import { BibleBook, BibleCategory } from "@/services/bibleService";
import { BookGrid } from "@/components/BookGrid";

interface BibleCategorySectionProps {
  category: BibleCategory;
  books: BibleBook[];
}

export const BibleCategorySection: React.FC<BibleCategorySectionProps> = ({ category, books }) => (
  <section className="mb-12" key={category.slug}>
    <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-4">{category.title}</h2>
    {category.description && (
      <p className="text-gray-300 mb-6">{category.description}</p>
    )}
    {books.length > 0 ? (
      <BookGrid books={books} />
    ) : (
      <p className="text-gray-400">Nenhum livro cadastrado para esta categoria.</p>
    )}
  </section>
);
