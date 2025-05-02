
import React from 'react';
import Biblia1BookItem from './Biblia1BookItem';
import { Book, Testament } from '@/services/biblia1Service';

interface Biblia1TestamentSectionProps {
  testament: Testament;
  books: Book[];
}

const Biblia1TestamentSection: React.FC<Biblia1TestamentSectionProps> = ({ testament, books }) => {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4 px-1">{testament.name}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {books.map(book => (
          <Biblia1BookItem key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default Biblia1TestamentSection;
