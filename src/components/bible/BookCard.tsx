
import React from 'react';
import { Book } from '@/types/bible';
import { Link } from 'react-router-dom';
import { AudioLines } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <Link 
      to={`/biblia/books/${book.id}`}
      className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <span className="text-lg font-medium text-[#1e1e1e]">{book.name}</span>
      <AudioLines className="h-5 w-5 text-gray-400" />
    </Link>
  );
};

export default BookCard;
