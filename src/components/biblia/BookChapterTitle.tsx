
import React from 'react';

interface BookChapterTitleProps {
  bookName: string;
  chapter: string;
  subtitle?: string;
}

const BookChapterTitle: React.FC<BookChapterTitleProps> = ({ 
  bookName, 
  chapter,
  subtitle
}) => {
  return (
    <div className="text-center mb-8 mt-6">
      <h2 className="text-3xl font-serif text-gray-800">{bookName}</h2>
      <h3 className="text-6xl font-bold font-serif text-gray-900 my-4">{chapter}</h3>
      {subtitle && (
        <h4 className="text-xl italic font-serif text-gray-700">{subtitle}</h4>
      )}
      <p className="text-sm text-gray-500 mt-2">jesusdiario.com.br</p>
    </div>
  );
};

export default BookChapterTitle;
