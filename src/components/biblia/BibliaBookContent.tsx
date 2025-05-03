
import React, { useState, useRef, useEffect } from 'react';
import { useBook, useVersesByBookChapter } from '@/hooks/useBiblia';
import { BibleVersion } from '@/types/biblia';
import BookHeader from './BookHeader';
import ChapterSelector from './ChapterSelector';
import ChapterNavigation from './ChapterNavigation';
import VersesList from './VersesList';
import VerseSelectionModal from './VerseSelectionModal';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useVerseSelection } from '@/hooks/useVerseSelection';
import { useVerseFavorites } from '@/hooks/useVerseFavorites';

interface BibliaBookContentProps {
  bookId: string;
  chapter: string;
  highlightVerse: number | null;
}

const BibliaBookContent: React.FC<BibliaBookContentProps> = ({ 
  bookId, 
  chapter, 
  highlightVerse 
}) => {
  // Estado para controlar a versão da Bíblia
  const [version, setVersion] = useState<BibleVersion>(() => {
    return (localStorage.getItem('bible-default-version') as BibleVersion) || 'acf';
  });
  
  // Referência para o container de versículos
  const versesContainerRef = useRef<HTMLDivElement>(null);
  
  // Custom hooks
  const { 
    selectedVerses, 
    showModal, 
    handleVerseSelect, 
    handleCloseModal 
  } = useVerseSelection();
  
  const { 
    isFavorite, 
    handleToggleFavorite, 
    handleAddToFavorites 
  } = useVerseFavorites();
  
  // Consulta de dados
  const { data: book, isLoading: isLoadingBook, error: bookError } = useBook(bookId || '');
  const { 
    data: verses, 
    isLoading: isLoadingVerses, 
    error: versesError 
  } = useVersesByBookChapter(bookId || '', chapter || '1', version);
  
  const isLoading = isLoadingBook || isLoadingVerses;
  const error = bookError || versesError;
  
  // Efeito para rolagem suave até o versículo destacado
  useEffect(() => {
    if (highlightVerse !== null && verses && verses.length > 0 && versesContainerRef.current) {
      // Dar tempo para o DOM renderizar
      setTimeout(() => {
        const verseElement = document.getElementById(`verse-${highlightVerse}`);
        if (verseElement) {
          verseElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 500);
    }
  }, [highlightVerse, verses]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
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
  
  // Obter título do livro e capítulo
  const bookTitle = book.name || '';
  const chapterTitle = chapter || '1';
  
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <BookHeader 
        bookTitle={bookTitle} 
        chapterTitle={chapterTitle}
        version={version}
        setVersion={setVersion}
      />
      
      <ChapterSelector book={book} currentChapter={chapterTitle} />
      
      <main ref={versesContainerRef} className="px-4 py-2 space-y-1 mb-16">
        <VersesList
          verses={verses}
          bookTitle={bookTitle}
          chapterTitle={chapterTitle}
          version={version}
          highlightVerse={highlightVerse}
          selectedVerses={selectedVerses}
          onVerseSelect={handleVerseSelect}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>
      
      <div className="fixed bottom-16 left-0 right-0 z-10">
        <ChapterNavigation book={book} chapter={chapterTitle} />
      </div>
      
      {showModal && (
        <VerseSelectionModal
          verses={selectedVerses}
          version={version}
          onClose={handleCloseModal}
          onAddToFavorites={handleAddToFavorites}
        />
      )}
    </div>
  );
};

export default BibliaBookContent;
