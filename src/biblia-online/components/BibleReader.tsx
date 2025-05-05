import React, { useState, useEffect } from 'react';
import { useBible } from '../hooks/useBible';
import { BibleHeader } from './BibleHeader';
import { BibleFooter } from './BibleFooter';
import { useVerseSelection } from '../hooks/useVerseSelection';
import { VersesSelectionModal } from './VersesSelectionModal';
import Sidebar from '@/components/Sidebar';
import { useSidebarControl } from '@/hooks/useSidebarControl';
import { BibleContent } from './BibleContent';
import { VerseSelectionButton } from './VerseSelectionButton';
import { BibleNavigation } from './BibleNavigation';

export const BibleReader: React.FC = () => {
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
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();

  // Logging para debugging
  useEffect(() => {
    console.log("Estado atual do BibleReader:", { 
      currentBookId, 
      currentBookSlug, 
      currentChapter, 
      isLoading, 
      chapterCount,
      hasChapterData: !!chapterData,
      versesCount: chapterData?.verses?.length || 0
    });
  }, [currentBookId, currentBookSlug, currentChapter, isLoading, chapterData, chapterCount]);

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
    navigateToBook(bookId, bookSlug);
    // Ao selecionar um livro, abrimos automaticamente a seleção de capítulos
    setIsNavigationOpen(false);
    setIsChapterSelectOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      
      <BibleHeader 
        bookName={getCurrentBookName()} 
        chapter={currentChapter} 
        onOpenBooksNav={handleOpenBooksNav} 
        currentTranslation={currentTranslation} 
        onChangeTranslation={changeTranslation}
        toggleSidebar={toggleSidebar}
      />
      
      <BibleContent 
        isLoading={isLoading}
        chapterData={chapterData}
        error={error}
        currentTranslation={currentTranslation}
        selectedVerses={selectedVerses}
        onVerseSelect={handleVerseSelect}
        isVerseSelected={isVerseSelected}
      />
      
      <VerseSelectionButton 
        selectedVerses={selectedVerses}
        showModal={showModal}
        onOpenModal={openModal}
      />
      
      <BibleFooter 
        bookName={getCurrentBookName()} 
        chapter={currentChapter} 
        onPreviousChapter={goToPreviousChapter} 
        onNextChapter={goToNextChapter} 
        onOpenBooksNav={handleOpenBooksNav} 
      />
      
      <BibleNavigation 
        isNavigationOpen={isNavigationOpen}
        isChapterSelectOpen={isChapterSelectOpen}
        books={books}
        currentBookId={currentBookId}
        bookName={getCurrentBookName()}
        chapterCount={chapterCount}
        currentChapter={currentChapter}
        onBookSelect={handleBookSelect}
        onChapterSelect={goToChapter}
        onCloseNavigation={() => setIsNavigationOpen(false)}
        onCloseChapterSelect={() => setIsChapterSelectOpen(false)}
      />
      
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
    </div>
  );
};