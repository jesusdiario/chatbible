
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from 'lucide-react';
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
            <ChapterIcon className="h-5 w-5" />
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

// Componentes de ícones fictícios
const Home = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const ChapterIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const CheckSquare = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

const Search = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ChevronLeft = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

export default ChapterSelector;
