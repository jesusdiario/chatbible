
import { useState } from 'react';
import { BibleBook } from '@/types/biblia';
import { getBookChapters } from '@/services/biblia';

export function useBibleNavigation(books: BibleBook[], chapterCount: number) {
  const [currentBook, setCurrentBook] = useState<BibleBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState(1);

  const selectBook = (book: BibleBook) => {
    setCurrentBook(book);
    setCurrentChapter(1); // Reset para o primeiro capítulo ao trocar de livro
  };

  const navigateToChapter = (chapter: number) => {
    if (chapter > 0 && chapter <= chapterCount) {
      setCurrentChapter(chapter);
    }
  };

  const nextChapter = () => {
    if (currentChapter < chapterCount) {
      setCurrentChapter(currentChapter + 1);
    } else if (books.length > 0 && currentBook) {
      // Ir para o próximo livro, capítulo 1
      const currentIndex = books.findIndex(b => b.id === currentBook.id);
      if (currentIndex < books.length - 1) {
        setCurrentBook(books[currentIndex + 1]);
        setCurrentChapter(1);
      }
    }
  };

  const previousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else if (books.length > 0 && currentBook) {
      // Ir para o livro anterior, último capítulo
      const currentIndex = books.findIndex(b => b.id === currentBook.id);
      if (currentIndex > 0) {
        const prevBook = books[currentIndex - 1];
        setCurrentBook(prevBook);
        getBookChapters(prevBook.id as number).then(count => {
          setCurrentChapter(count);
        });
      }
    }
  };

  // Inicializa o livro atual se não estiver definido e houver livros disponíveis
  const initializeBook = (availableBooks: BibleBook[]) => {
    if (availableBooks.length > 0 && !currentBook) {
      setCurrentBook(availableBooks[0]);
    }
  };

  return {
    currentBook,
    currentChapter,
    selectBook,
    navigateToChapter,
    nextChapter,
    previousChapter,
    initializeBook
  };
}
