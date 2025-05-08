
import React, { useState, useEffect } from 'react';
import { BibleHeader } from './BibleHeader';
import { BibleVerse } from './BibleVerse';
import { BooksNavigation } from './BooksNavigation';
import { ChapterNavigation } from './ChapterNavigation';
import { BibleFooter } from './BibleFooter';
import { useBible } from '../hooks/useBible';
import { BibleTranslation } from '../services/bibleService';
import { VersesSelectionModal } from './VersesSelectionModal';
import { useVerseSelection } from '../hooks/useVerseSelection';

interface BibleReaderProps {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const {
    bookName,
    bookSlug,
    bookTitle,
    chapter,
    verses,
    isLoading,
    error,
    nextChapter,
    previousChapter,
    goToChapter,
    numberOfChapters,
    currentTranslation,
    setCurrentTranslation
  } = useBible();

  const {
    selectedVerses,
    toggleVerseSelection,
    isSelectionModalOpen,
    setIsSelectionModalOpen,
    selectedText,
    clearSelection
  } = useVerseSelection();

  const [isBooksNavOpen, setIsBooksNavOpen] = useState(false);

  useEffect(() => {
    document.title = `${bookName} ${chapter} - Bíblia Online`;
  }, [bookName, chapter]);

  return (
    <div className="min-h-screen flex flex-col">
      <BibleHeader
        bookName={bookName}
        chapter={chapter}
        onOpenBooksNav={() => setIsBooksNavOpen(true)}
        currentTranslation={currentTranslation}
        onChangeTranslation={setCurrentTranslation}
        toggleSidebar={toggleSidebar || (() => {})}
        isSidebarOpen={isSidebarOpen}
      />

      <main className="flex-grow pb-20 pt-4 px-4 md:px-8 lg:px-16 max-w-3xl mx-auto w-full">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : (
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
              {bookTitle} {chapter}
            </h1>
            <div className="space-y-2">
              {verses.map((verse) => (
                <BibleVerse
                  key={verse.number}
                  verse={verse}
                  isSelected={selectedVerses.includes(verse.number)}
                  onToggleSelection={() => toggleVerseSelection(verse.number)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      <BibleFooter />

      <ChapterNavigation 
        currentChapter={chapter}
        totalChapters={numberOfChapters}
        onPrevious={previousChapter}
        onNext={nextChapter}
        onGoToChapter={goToChapter}
      />

      <BooksNavigation 
        isOpen={isBooksNavOpen} 
        onClose={() => setIsBooksNavOpen(false)}
        currentBook={bookSlug}
        currentChapter={chapter}
      />

      <VersesSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        selectedText={selectedText}
        book={bookName}
        chapter={chapter}
        selectedVerses={selectedVerses}
        onClearSelection={clearSelection}
      />
    </div>
  );
};

