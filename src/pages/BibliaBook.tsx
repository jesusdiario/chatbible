
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import BibliaBookContent from '@/components/biblia/BibliaBookContent';

const BibliaBook: React.FC = () => {
  const { bookId, chapter } = useParams<{ bookId: string; chapter: string }>();
  const [searchParams] = useSearchParams();
  const highlightVerseStr = searchParams.get('highlight');
  
  // Converter highlight para número se necessário
  const highlightVerse = highlightVerseStr ? parseInt(highlightVerseStr, 10) : null;
  
  return (
    <>
      <BibliaBookContent 
        bookId={bookId || ''} 
        chapter={chapter || '1'} 
        highlightVerse={highlightVerse} 
      />
      <BibliaBottomNav />
    </>
  );
};

export default BibliaBook;
