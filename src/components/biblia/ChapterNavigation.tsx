
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Book } from '@/types/biblia';

interface ChapterNavigationProps {
  book: Book | null;
  chapter: string;
}

const ChapterNavigation: React.FC<ChapterNavigationProps> = ({ book, chapter }) => {
  const navigate = useNavigate();
  
  if (!book) return null;
  
  const currentChapter = parseInt(chapter);
  const hasNextChapter = currentChapter < book.chaptersCount;
  const hasPrevChapter = currentChapter > 1;
  
  const goToPrevChapter = () => {
    if (hasPrevChapter) {
      navigate(`/biblia/${book.id}/${currentChapter - 1}`);
      // Rolar para o topo da página com animação suave
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const goToNextChapter = () => {
    if (hasNextChapter) {
      navigate(`/biblia/${book.id}/${currentChapter + 1}`);
      // Rolar para o topo da página com animação suave
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <button
        onClick={goToPrevChapter}
        disabled={!hasPrevChapter}
        className={`flex items-center ${!hasPrevChapter ? 'text-gray-300' : 'text-blue-600'}`}
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        <span>Anterior</span>
      </button>
      
      <span className="text-lg font-medium text-center">
        {book.name} {chapter}
      </span>
      
      <button
        onClick={goToNextChapter}
        disabled={!hasNextChapter}
        className={`flex items-center ${!hasNextChapter ? 'text-gray-300' : 'text-blue-600'}`}
      >
        <span>Próximo</span>
        <ChevronRight className="h-5 w-5 ml-1" />
      </button>
    </div>
  );
};

export default ChapterNavigation;
