
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '@/types/biblia';

interface BibliaBookItemProps {
  book: Book;
}

const BibliaBookItem: React.FC<BibliaBookItemProps> = ({ book }) => {
  return (
    <Link 
      to={`/biblia/${book.id}/1`} 
      className="flex flex-col items-center p-3"
    >
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <span className="text-gray-800 font-bold text-lg">{book.abbrev.toUpperCase()}</span>
      </div>
      <span className="text-center font-medium">{book.name}</span>
    </Link>
  );
};

export default BibliaBookItem;
