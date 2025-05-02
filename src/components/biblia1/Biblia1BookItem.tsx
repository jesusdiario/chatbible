
import React from 'react';
import { Book } from '@/services/biblia1Service';

interface Biblia1BookItemProps {
  book: Book;
}

const Biblia1BookItem: React.FC<Biblia1BookItemProps> = ({ book }) => {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
        <span className="text-gray-700 font-medium">{book.abbrev}</span>
      </div>
      <span className="text-sm">{book.name}</span>
    </div>
  );
};

export default Biblia1BookItem;
