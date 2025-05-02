
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBibleChapters } from '@/hooks/useBibleChapters';
import { useBookById } from '@/hooks/useBibleBooks';
import ChapterButton from '@/components/bible/ChapterButton';
import BottomNav from '@/components/bible/BottomNav';
import { AudioLines, ArrowLeft } from 'lucide-react';

const ChaptersGrid: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const bookId = id ? parseInt(id, 10) : null;
  const navigate = useNavigate();
  
  const { data: book, isLoading: isLoadingBook } = useBookById(bookId);
  const { data: chapterCount, isLoading: isLoadingChapters } = useBibleChapters(bookId);
  
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);
  
  const handleBack = () => {
    navigate('/biblia/books');
  };
  
  return (
    <div className="pb-20 min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={handleBack} className="p-1">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-medium">{book?.name || 'Carregando...'}</h1>
        </div>
        <button className="p-2">
          <AudioLines className="h-5 w-5 text-gray-500" />
        </button>
      </header>
      
      {isLoadingBook || isLoadingChapters ? (
        <div className="flex justify-center items-center h-64">
          <p>Carregando capítulos...</p>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {chapters.map((chapter) => (
              <ChapterButton key={chapter} bookId={bookId || 0} chapter={chapter} />
            ))}
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default ChaptersGrid;
