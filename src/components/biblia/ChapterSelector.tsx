
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '@/services/bibliaService';

interface ChapterSelectorProps {
  book: Book | null;
  currentChapter: string;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({ book, currentChapter }) => {
  const navigate = useNavigate();
  
  const chapters = useMemo(() => {
    if (!book) return [];
    return Array.from({ length: book.chaptersCount }, (_, i) => (i + 1).toString());
  }, [book]);
  
  const handleChapterChange = (chapter: string) => {
    if (book) {
      navigate(`/biblia/${book.id}/${chapter}`);
      // Rolar para o topo com animação suave
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  if (!book || chapters.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 justify-center my-4 px-4">
      {chapters.map(chapter => (
        <button
          key={chapter}
          onClick={() => handleChapterChange(chapter)}
          className={`w-10 h-10 flex items-center justify-center rounded-full ${
            chapter === currentChapter 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {chapter}
        </button>
      ))}
    </div>
  );
};

export default ChapterSelector;
