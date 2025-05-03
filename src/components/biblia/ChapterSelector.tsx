
import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Book, Home, Search, CheckSquare, ChevronLeft } from 'lucide-react';
import { Book as BookType } from '@/types/biblia';

interface ChapterSelectorProps {
  book: BookType | null;
  currentChapter: string;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({ book, currentChapter }) => {
  const [showChapterGrid, setShowChapterGrid] = useState(false);
  const navigate = useNavigate();
  
  const chapters = useMemo(() => {
    if (!book) return [];
    return Array.from({ length: book.chaptersCount }, (_, i) => (i + 1).toString());
  }, [book]);
  
  const handleChapterChange = (chapter: string) => {
    if (book) {
      navigate(`/biblia/${book.id}/${chapter}`);
      setShowChapterGrid(false);
      // Rolar para o topo com animação suave
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  if (!book || chapters.length === 0) return null;
  
  return (
    <>
      {showChapterGrid && (
        <div className="fixed inset-0 bg-white z-30 overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
            <button
              onClick={() => setShowChapterGrid(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold">{book.name}</h2>
            <div className="w-10"></div> {/* Spacer */}
          </div>
          
          <div className="p-4 grid grid-cols-6 gap-3">
            {chapters.map(chapter => (
              <button
                key={chapter}
                onClick={() => handleChapterChange(chapter)}
                className={`aspect-square flex items-center justify-center rounded-lg ${
                  chapter === currentChapter 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {chapter}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-white border-t grid grid-cols-5 py-2">
        <Link
          to="/"
          className="flex flex-col items-center justify-center"
        >
          <div className="h-6 w-6 flex items-center justify-center">
            <Home className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">Início</span>
        </Link>
        
        <Link
          to="/biblia"
          className="flex flex-col items-center justify-center"
        >
          <div className="h-6 w-6 flex items-center justify-center">
            <Book className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">Bíblia</span>
        </Link>
        
        <button
          onClick={() => setShowChapterGrid(true)}
          className="flex flex-col items-center justify-center"
        >
          <div className="h-6 w-6 flex items-center justify-center">
            <Book className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">{book.name} {currentChapter}</span>
        </button>
        
        <Link
          to="/planos"
          className="flex flex-col items-center justify-center"
        >
          <div className="h-6 w-6 flex items-center justify-center">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">Planos</span>
        </Link>
        
        <Link
          to="/descubra"
          className="flex flex-col items-center justify-center"
        >
          <div className="h-6 w-6 flex items-center justify-center">
            <Search className="h-5 w-5" />
          </div>
          <span className="text-xs mt-1">Descubra</span>
        </Link>
      </div>
    </>
  );
};

export default ChapterSelector;
