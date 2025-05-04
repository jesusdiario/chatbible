
import React, { useState } from 'react';
import { useBible } from '../hooks/useBible';
import { Sheet, SheetContent } from '../components/ui/sheet';
import { BooksNavigation } from './BooksNavigation';
import { ChapterNavigation } from './ChapterNavigation';
import { BibleVerse } from './BibleVerse';
import { BibleHeader } from './BibleHeader';
import { BibleFooter } from './BibleFooter';
import { ScrollArea } from '../components/ui/scroll-area';
import { BibleTranslation } from '../services/bibleService';

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
    navigateToBook,
    goToPreviousChapter,
    goToNextChapter,
    goToChapter,
    changeTranslation,
    getCurrentBookName
  } = useBible();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isChapterSelectOpen, setIsChapterSelectOpen] = useState(false);

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

  // Controlador de navegação para o rodapé
  const handleFooterClick = () => {
    handleOpenBooksNav();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <BibleHeader 
        bookName={getCurrentBookName()} 
        chapter={currentChapter} 
        onOpenBooksNav={handleOpenBooksNav} 
        currentTranslation={currentTranslation} 
        onChangeTranslation={changeTranslation} 
      />
      
      <ScrollArea className="flex-1 pb-32">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : chapterData ? (
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
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Nenhum conteúdo disponível
          </div>
        )}
      </ScrollArea>
      
      <BibleFooter 
        bookName={getCurrentBookName()} 
        chapter={currentChapter} 
        onPreviousChapter={goToPreviousChapter} 
        onNextChapter={goToNextChapter} 
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
    </div>
  );
};
