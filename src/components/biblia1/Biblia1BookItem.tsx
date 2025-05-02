
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '@/services/biblia1Service';

interface Biblia1BookItemProps {
  book: Book;
}

const Biblia1BookItem: React.FC<Biblia1BookItemProps> = ({ book }) => {
  return (
    <Link to={`/biblia/${book.id}`} className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
        <span className="text-gray-700 font-medium">{book.abbrev}</span>
      </div>
      <span className="text-sm text-center">{book.name}</span>
    </Link>
  );
};

export default Biblia1BookItem;
