
import React from 'react';
import { Book, Testament } from '@/services/biblia1Service';
import Biblia1BookItem from './Biblia1BookItem';

interface Biblia1TestamentSectionProps {
  testament: Testament;
  books: Book[];
}

const Biblia1TestamentSection: React.FC<Biblia1TestamentSectionProps> = ({ testament, books }) => {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold mb-4">{testament.name}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
        {books.map((book) => (
          <Biblia1BookItem key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
};

export default Biblia1TestamentSection;
