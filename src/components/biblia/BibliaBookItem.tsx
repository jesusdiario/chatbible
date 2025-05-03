
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
      className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
        <span className="text-blue-700 font-medium">{book.abbrev}</span>
      </div>
      <span className="text-sm font-medium text-center">{book.name}</span>
      <span className="text-xs text-gray-500">{book.chaptersCount} capítulos</span>
    </Link>
  );
};

export default BibliaBookItem;
