
import React from 'react';
import { Book, Testament } from '@/types/biblia';
import BibliaBookItem from './BibliaBookItem';

interface BibliaTestamentSectionProps {
  testament: Testament;
  books: Book[];
}

const BibliaTestamentSection: React.FC<BibliaTestamentSectionProps> = ({ testament, books }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">{testament.name}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-items-center">
        {books.map((book) => (
          <BibliaBookItem key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
};

export default BibliaTestamentSection;
