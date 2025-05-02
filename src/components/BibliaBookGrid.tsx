
import React from 'react';
import { Link } from 'react-router-dom';
import { BibleBook } from '@/types/bible';

interface BookItemProps {
  book: BibleBook;
}

const BookItem: React.FC<BookItemProps> = ({ book }) => {
  // Use abbrev if available, otherwise create abbreviation from name
  const abbrev = book.abbrev || book.name?.substring(0, 2).toUpperCase() || "";
  
  return (
    <div className="flex flex-col items-center">
      <Link 
        to={`/biblia/${book.id}`} 
        className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2 hover:bg-gray-200 transition-colors"
      >
        <span className="font-medium text-gray-800">{abbrev}</span>
      </Link>
      <span className="text-sm text-center">{book.name || book.title}</span>
    </div>
  );
};

interface BookGridProps {
  books: BibleBook[];
}

export const BookGrid: React.FC<BookGridProps> = ({ books }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-7 gap-6">
      {books.map((book) => (
        <BookItem key={book.id} book={book} />
      ))}
    </div>
  );
};
