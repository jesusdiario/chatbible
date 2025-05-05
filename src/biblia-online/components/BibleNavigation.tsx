
import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BooksNavigation } from './BooksNavigation';
import { ChapterNavigation } from './ChapterNavigation';
import { Book } from '../services/bibleService';

interface BibleNavigationProps {
  isNavigationOpen: boolean;
  isChapterSelectOpen: boolean;
  books: Book[];
  currentBookId: number;
  bookName: string;
  chapterCount: number;
  currentChapter: number;
  onBookSelect: (bookId: number, bookSlug: string) => void;
  onChapterSelect: (chapter: number) => void;
  onCloseNavigation: () => void;
  onCloseChapterSelect: () => void;
}

export const BibleNavigation: React.FC<BibleNavigationProps> = ({
  isNavigationOpen,
  isChapterSelectOpen,
  books,
  currentBookId,
  bookName,
  chapterCount,
  currentChapter,
  onBookSelect,
  onChapterSelect,
  onCloseNavigation,
  onCloseChapterSelect
}) => {
  return (
    <>
      {/* Sheet para navegação de livros */}
      <Sheet open={isNavigationOpen} onOpenChange={onCloseNavigation}>
        <SheetContent side="left" className="p-0 w-full sm:w-[400px]">
          <BooksNavigation 
            books={books} 
            currentBookId={currentBookId} 
            onBookSelect={onBookSelect} 
            onClose={onCloseNavigation} 
          />
        </SheetContent>
      </Sheet>
      
      {/* Sheet para seleção de capítulos */}
      <Sheet open={isChapterSelectOpen} onOpenChange={onCloseChapterSelect}>
        <SheetContent side="left" className="p-0 w-full sm:w-[400px]">
          <ChapterNavigation 
            bookName={bookName} 
            chapterCount={chapterCount} 
            currentChapter={currentChapter} 
            onChapterSelect={onChapterSelect} 
            onBack={onCloseChapterSelect} 
          />
        </SheetContent>
      </Sheet>
    </>
  );
};
