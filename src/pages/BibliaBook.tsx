
import React from 'react';
import { useParams } from 'react-router-dom';
import { useBook, useVersesByBook } from '@/hooks/useBiblia1Data';
import Biblia1BottomNav from '@/components/biblia1/Biblia1BottomNav';
import { Loader2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BibliaBook: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { book, isLoading: isLoadingBook, error: bookError } = useBook(Number(bookId));
  const { verses, isLoading: isLoadingVerses, error: versesError } = useVersesByBook(Number(bookId));
  
  const isLoading = isLoadingBook || isLoadingVerses;
  const error = bookError || versesError;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="mt-4">Carregando...</span>
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <p>Erro ao carregar o livro</p>
        <p className="text-sm mt-2">{(error as Error)?.message || 'Livro não encontrado'}</p>
        <Link to="/biblia" className="mt-4 text-blue-500 flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar para Bíblia
        </Link>
      </div>
    );
  }
  
  // Agrupar versos por capítulo
  const versesByChapter: Record<number, Array<{ verse: number, text: string }>> = {};
  
  verses?.forEach(verse => {
    if (verse.chapter) {
      if (!versesByChapter[verse.chapter]) {
        versesByChapter[verse.chapter] = [];
      }
      versesByChapter[verse.chapter].push({ 
        verse: verse.verse || 0, 
        text: verse.text || '' 
      });
    }
  });
  
  return (
    <div className="pb-20 max-w-4xl mx-auto px-4">
      <header className="py-6 flex items-center">
        <Link to="/biblia" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">{book.name}</h1>
      </header>
      
      <main>
        {Object.entries(versesByChapter).map(([chapter, versesInChapter]) => (
          <div key={chapter} className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Capítulo {chapter}</h2>
            <div className="space-y-2">
              {versesInChapter.map(verse => (
                <p key={verse.verse} className="text-gray-800">
                  <span className="text-xs align-super font-bold text-gray-500 mr-1">{verse.verse}</span>
                  {verse.text}
                </p>
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(versesByChapter).length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <p>Não há versículos disponíveis para este livro.</p>
          </div>
        )}
      </main>
      
      <Biblia1BottomNav />
    </div>
  );
};

export default BibliaBook;
