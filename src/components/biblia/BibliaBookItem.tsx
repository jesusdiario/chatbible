
import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '@/services/bibliaService';

interface BibliaBookItemProps {
  book: Book;
}

const BibliaBookItem: React.FC<BibliaBookItemProps> = ({ book }) => {
  const abbrev = book.abbrev || book.id.split('.')[1];
  
  return (
    <Link 
      to={`/biblia/${book.id}/1`} 
      className="flex flex-col items-center p-3 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2">
        <span className="text-gray-700 font-medium">{abbrev}</span>
      </div>
      <span className="text-sm text-center">{book.name}</span>
      <span className="text-xs text-gray-500">{book.chaptersCount} capítulos</span>
    </Link>
  );
};

export default BibliaBookItem;
