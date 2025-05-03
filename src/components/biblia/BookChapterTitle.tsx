
import React from 'react';

interface BookChapterTitleProps {
  bookName: string;
  chapter: string;
}

const BookChapterTitle: React.FC<BookChapterTitleProps> = ({ bookName, chapter }) => {
  return (
    <div className="text-center mb-8 mt-2">
      <h2 className="text-3xl font-serif text-gray-800">{bookName}</h2>
      <h3 className="text-6xl font-bold font-serif text-gray-900 my-4">{chapter}</h3>
      {bookName === "João" && chapter === "1" && (
        <h4 className="text-2xl italic font-serif text-gray-700">A encarnação do Verbo</h4>
      )}
    </div>
  );
};

export default BookChapterTitle;
