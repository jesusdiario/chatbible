
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useBible } from '../hooks/useBible';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BooksNavigation } from './BooksNavigation';
import { ChapterNavigation } from './ChapterNavigation';
import { BibleVerse } from './BibleVerse';
import { BibleHeader } from './BibleHeader';
import { BibleFooter } from './BibleFooter';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BibleTranslation } from '../services/bibleService';
import { Loader2, BookOpen } from 'lucide-react';
import { useVerseSelection } from '../hooks/useVerseSelection';
import { VersesSelectionModal } from './VersesSelectionModal';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyGuideButton } from './StudyGuide/StudyGuideButton';
import { StudyGuideModal } from './StudyGuide/StudyGuideModal';
import { StudyGuideQuestion } from '../types/studyGuide';
import { useAuth } from '@/contexts/AuthContext';

// Interface for localStorage reading progress
interface ReadingProgress {
  bookId: number;
  bookSlug: string;
  chapter: number;
  translation: BibleTranslation;
  lastVerseId?: number;
  lastScrollPosition?: number;
}

// Storage key for reading progress
const READING_PROGRESS_KEY = 'bible_reading_progress';

interface BibleReaderProps {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({ 
  isSidebarOpen, 
  toggleSidebar 
}) => {
  const { user } = useAuth();
  
  const {
    books,
    currentBookId,
    currentBookSlug,
    currentChapter,
    currentTranslation,
    chapterData,
    isLoading,
    chapterCount,
    error,
    navigateToBook,
    goToPreviousChapter,
    goToNextChapter,
    goToChapter,
    changeTranslation,
    getCurrentBookName
  } = useBible();
  
  const {
    selectedVerses,
    showModal,
    bibleButtons,
    isLoadingButtons,
    handleVerseSelect,
    handleCloseModal,
    isVerseSelected,
    getVerseReference,
    getSelectedVersesText,
    openModal,
    clearSelection
  } = useVerseSelection();
  
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isChapterSelectOpen, setIsChapterSelectOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isStudyGuideOpen, setIsStudyGuideOpen] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  
  // Track scroll position
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const position = e.currentTarget.scrollTop;
    setScrollPosition(position);
    
    // Salvar a posição de rolagem no localStorage
    try {
      localStorage.setItem('bible:lastScrollPosition', JSON.stringify(position));
    } catch (error) {
      console.warn('Não foi possível salvar a posição de rolagem', error);
    }
  };

  // Restaurar a posição de rolagem quando o conteúdo do capítulo for carregado
  useEffect(() => {
    if (!isLoading && chapterData && chapterData.verses && chapterData.verses.length > 0) {
      try {
        const savedScrollPosition = localStorage.getItem('bible:lastScrollPosition');
        if (savedScrollPosition) {
          const position = JSON.parse(savedScrollPosition);
          
          // Precisamos de um pequeno atraso para garantir que o DOM esteja pronto
          setTimeout(() => {
            const scrollContainer = document.querySelector('.scroll-area-viewport');
            if (scrollContainer) {
              scrollContainer.scrollTop = position;
              console.log('Posição de rolagem restaurada:', position);
            }
          }, 100);
        }
      } catch (error) {
        console.warn('Não foi possível restaurar a posição de rolagem', error);
      }
    }
  }, [isLoading, chapterData]);

  // Handle touch events for swipe navigation
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };
  
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    
    // Minimum distance for swipe (px)
    const minSwipeDistance = 50;
    
    if (Math.abs(deltaX) > minSwipeDistance) {
      setIsTransitioning(true);
      
      // Right to left swipe (next chapter)
      if (deltaX < 0) {
        goToNextChapter();
      } 
      // Left to right swipe (previous chapter)
      else {
        goToPreviousChapter();
      }
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }
    
    setTouchStartX(null);
  };

  // Manipular a navegação de livros
  const handleOpenBooksNav = () => {
    setIsNavigationOpen(true);
  };

  // Manipular a seleção de capítulos
  const handleOpenChapterNav = () => {
    setIsChapterSelectOpen(true);
  };

  // Manipular a seleção de livro
  const handleBookSelect = (bookId: number, bookSlug: string) => {
    setIsTransitioning(true);
    navigateToBook(bookId, bookSlug);
    // Ao selecionar um livro, abrimos automaticamente a seleção de capítulos
    setIsNavigationOpen(false);
    setIsChapterSelectOpen(true);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Controlador de navegação para o rodapé
  const handleFooterClick = () => {
    handleOpenBooksNav();
  };

  // Navegação com animação
  const handleNavigatePrevious = () => {
    setIsTransitioning(true);
    goToPreviousChapter();
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const handleNavigateNext = () => {
    setIsTransitioning(true);
    goToNextChapter();
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Handle study guide question selection
  const handleStudyGuideQuestionSelect = (question: StudyGuideQuestion) => {
    // Implementation will go here
    console.log('Selected question:', question);
    // You could navigate to a chat or trigger some action here
  };

  // Renderizar mensagem de erro ou conteúdo vazio
  const renderEmptyOrError = () => {
    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-64 text-gray-500">
          <p className="mb-2 text-red-500">{error}</p>
          <p>Tente selecionar outro livro ou capítulo</p>
        </div>
      );
    }
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Nenhum conteúdo disponível
      </div>
    );
  };

  // Adicionar botão flutuante para abrir o modal se houver versículos selecionados
  const renderSelectionFloatingButton = () => {
    if (selectedVerses.length > 0 && !showModal) {
      return (
        <button
          onClick={openModal}
          className="fixed bottom-24 right-4 bg-primary text-white rounded-full p-3 shadow-lg z-50 md:bottom-28"
          aria-label="Ver versículos selecionados"
        >
          <div className="relative">
            <BookOpen className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {selectedVerses.length}
            </span>
          </div>
        </button>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <BibleHeader 
        bookName={getCurrentBookName()} 
        chapter={currentChapter} 
        onOpenBooksNav={handleOpenBooksNav} 
        currentTranslation={currentTranslation} 
        onChangeTranslation={changeTranslation} 
        toggleSidebar={toggleSidebar || (() => {})}
        isSidebarOpen={isSidebarOpen}
      />
      
      <div className="flex justify-center pt-2 pb-4 bg-white border-b">
        <StudyGuideButton onClick={() => setIsStudyGuideOpen(true)} />
      </div>
      
      <ScrollArea 
        className="flex-1 pb-32 scroll-area"
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentBookId}-${currentChapter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-gray-500">Carregando conteúdo...</p>
              </div>
            ) : chapterData && chapterData.verses && chapterData.verses.length > 0 ? (
              <div className="p-4 max-w-2xl mx-auto">
                <div className="text-center mb-10">
                  <h1 className="text-3xl text-gray-500 font-medium mb-2">{chapterData.book_name}</h1>
                  <h2 className="text-8xl font-bold mb-6">{chapterData.chapter}</h2>
                </div>
                
                <div className="mt-8 mb-32">
                  {chapterData.verses.map(verse => (
                    <BibleVerse 
                      key={verse.id} 
                      verse={verse} 
                      translation={currentTranslation} 
                      showActions={true}
                      isSelected={isVerseSelected(verse)}
                      onSelect={handleVerseSelect}
                    />
                  ))}
                </div>
              </div>
            ) : (
              renderEmptyOrError()
            )}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
      
      {renderSelectionFloatingButton()}
      
      <BibleFooter 
        bookName={getCurrentBookName()} 
        chapter={currentChapter} 
        onPreviousChapter={handleNavigatePrevious} 
        onNextChapter={handleNavigateNext} 
        onOpenBooksNav={handleFooterClick} 
      />
      
      {/* Sheet para navegação de livros */}
      <Sheet open={isNavigationOpen} onOpenChange={setIsNavigationOpen}>
        <SheetContent side="left" className="p-0 w-full sm:w-[400px]">
          <BooksNavigation 
            books={books} 
            currentBookId={currentBookId} 
            onBookSelect={handleBookSelect} 
            onClose={() => setIsNavigationOpen(false)} 
          />
        </SheetContent>
      </Sheet>
      
      {/* Sheet para seleção de capítulos */}
      <Sheet open={isChapterSelectOpen} onOpenChange={setIsChapterSelectOpen}>
        <SheetContent side="left" className="p-0 w-full sm:w-[400px]">
          <ChapterNavigation 
            bookName={getCurrentBookName()} 
            chapterCount={chapterCount} 
            currentChapter={currentChapter} 
            onChapterSelect={goToChapter} 
            onBack={() => setIsChapterSelectOpen(false)} 
          />
        </SheetContent>
      </Sheet>
      
      {/* Modal de seleção de versículos */}
      <VersesSelectionModal
        open={showModal}
        onClose={handleCloseModal}
        verseReference={getVerseReference()}
        selectedVerses={selectedVerses}
        currentTranslation={currentTranslation}
        buttons={bibleButtons}
        isLoadingButtons={isLoadingButtons}
        getSelectedVersesText={getSelectedVersesText}
        clearSelection={clearSelection}
      />
      
      {/* Modal do guia de estudos */}
      <StudyGuideModal
        open={isStudyGuideOpen}
        onOpenChange={setIsStudyGuideOpen}
        bookSlug={currentBookSlug}
        onQuestionSelect={handleStudyGuideQuestionSelect}
      />
    </div>
  );
};
