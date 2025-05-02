
import React from 'react';
import { Link } from 'react-router-dom';

interface ChapterButtonProps {
  bookId: number;
  chapter: number;
}

const ChapterButton: React.FC<ChapterButtonProps> = ({ bookId, chapter }) => {
  return (
    <Link
      to={`/biblia/books/${bookId}/${chapter}`}
      className="flex items-center justify-center rounded-lg bg-gray-100 p-4 aspect-square
                hover:bg-gray-200 active:opacity-75 focus-visible:outline focus-visible:outline-blue-500
                transition-colors"
    >
      <span className="text-xl font-medium text-[#1e1e1e]">{chapter}</span>
    </Link>
  );
};

export default ChapterButton;
