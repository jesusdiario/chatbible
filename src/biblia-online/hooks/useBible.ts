
import { useState, useEffect } from 'react';
import { BibleService, Book, Chapter, BibleTranslation } from '../services/bibleService';
import { useToast } from '../hooks/use-toast';

export function useBible() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentBookId, setCurrentBookId] = useState<number>(40); // Iniciar com Mateus (id 40)
  const [currentBookSlug, setCurrentBookSlug] = useState<string>('mateus'); // Iniciar com Mateus
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [currentTranslation, setCurrentTranslation] = useState<BibleTranslation>(BibleTranslation.Default);
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chapterCount, setChapterCount] = useState<number>(0);
  const { toast } = useToast();

  // Carregar lista de livros
  useEffect(() => {
    const loadBooks = async () => {
      try {
        console.log('useBible: Loading books...');
        setIsLoading(true);
        const booksData = await BibleService.getBooks();
        setBooks(booksData);
        console.log(`useBible: Loaded ${booksData.length} books`);
        
        // Atualize o slug inicial se necessário
        if (booksData.length > 0) {
          const initialBook = booksData.find(book => book.id === currentBookId);
          if (initialBook && initialBook.slug !== currentBookSlug) {
            console.log(`useBible: Updating initial book slug to ${initialBook.slug}`);
            setCurrentBookSlug(initialBook.slug);
          }
        }
      } catch (error) {
        console.error('useBible Error (loadBooks):', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de livros',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [toast]);

  // Carregar capítulo atual
  useEffect(() => {
    const loadChapter = async () => {
      if (!currentBookId || !currentBookSlug) {
        console.log('useBible: No book ID or slug available to load chapter');
        return;
      }
      
      try {
        console.log(`useBible: Loading chapter ${currentChapter} of book ${currentBookSlug} (ID: ${currentBookId})...`);
        setIsLoading(true);
        
        // Obter contagem de capítulos para o livro
        const count = await BibleService.getChapterCount(currentBookId);
        setChapterCount(count);
        console.log(`useBible: Book has ${count} chapters`);
        
        // Ajustar capítulo se necessário (por exemplo, se mudarmos para um livro com menos capítulos)
        const adjustedChapter = Math.min(currentChapter, count || 1);
        if (adjustedChapter !== currentChapter) {
          console.log(`useBible: Adjusting chapter from ${currentChapter} to ${adjustedChapter}`);
          setCurrentChapter(adjustedChapter);
          return; // Isso acionará outra chamada useEffect
        }
        
        // Carregar os dados do capítulo usando o slug para melhor SEO
        let chapter: Chapter | null = null;
        chapter = await BibleService.getChapterBySlug(currentBookSlug, adjustedChapter);
        
        if (!chapter) {
          console.log('useBible: Falling back to ID-based chapter fetch');
          chapter = await BibleService.getChapter(currentBookId, adjustedChapter);
        }
        
        if (chapter && chapter.verses.length > 0) {
          console.log(`useBible: Loaded chapter with ${chapter.verses.length} verses`);
        } else {
          console.log('useBible: No verses found for chapter');
        }
        
        setChapterData(chapter);
      } catch (error) {
        console.error('useBible Error (loadChapter):', error);
        toast({
          title: 'Erro',
          description: `Não foi possível carregar o capítulo ${currentChapter}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadChapter();
  }, [currentBookId, currentBookSlug, currentChapter, toast]);

  // Navegar para outro livro
  const navigateToBook = (bookId: number, bookSlug?: string) => {
    console.log(`useBible: Navigating to book ID ${bookId} ${bookSlug ? `(slug: ${bookSlug})` : ''}`);
    if (bookId !== currentBookId) {
      setCurrentBookId(bookId);
      if (bookSlug) {
        setCurrentBookSlug(bookSlug);
      } else {
        // Encontre o slug pelo ID
        const book = books.find(b => b.id === bookId);
        if (book) {
          console.log(`useBible: Found slug ${book.slug} for book ID ${bookId}`);
          setCurrentBookSlug(book.slug);
        } else {
          console.warn(`useBible: Could not find slug for book ID ${bookId}`);
        }
      }
      setCurrentChapter(1); // Reiniciar para o capítulo 1 ao mudar de livros
    }
  };

  // Navegar para o capítulo anterior
  const goToPreviousChapter = () => {
    console.log(`useBible: Moving to previous chapter (current: ${currentChapter})`);
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else {
      // Ir para o livro anterior, último capítulo
      const currentBookIndex = books.findIndex((book) => book.id === currentBookId);
      if (currentBookIndex > 0) {
        const previousBook = books[currentBookIndex - 1];
        console.log(`useBible: Moving to previous book ${previousBook.name}, last chapter (${previousBook.chapter_count})`);
        navigateToBook(previousBook.id, previousBook.slug);
        setCurrentChapter(previousBook.chapter_count);
      }
    }
  };

  // Navegar para o próximo capítulo
  const goToNextChapter = () => {
    console.log(`useBible: Moving to next chapter (current: ${currentChapter}, max: ${chapterCount})`);
    if (currentChapter < chapterCount) {
      setCurrentChapter(currentChapter + 1);
    } else {
      // Ir para o próximo livro, capítulo 1
      const currentBookIndex = books.findIndex((book) => book.id === currentBookId);
      if (currentBookIndex < books.length - 1) {
        const nextBook = books[currentBookIndex + 1];
        console.log(`useBible: Moving to next book ${nextBook.name}, chapter 1`);
        navigateToBook(nextBook.id, nextBook.slug);
        setCurrentChapter(1);
      }
    }
  };

  // Navegar para um capítulo específico
  const goToChapter = (chapter: number) => {
    if (chapter >= 1 && chapter <= chapterCount) {
      console.log(`useBible: Going to chapter ${chapter}`);
      setCurrentChapter(chapter);
    } else {
      console.warn(`useBible: Invalid chapter number ${chapter} (max: ${chapterCount})`);
    }
  };

  // Alterar tradução
  const changeTranslation = (translation: BibleTranslation) => {
    console.log(`useBible: Changing translation to ${translation}`);
    setCurrentTranslation(translation);
  };

  // Obter nome do livro atual
  const getCurrentBookName = (): string => {
    const currentBook = books.find((book) => book.id === currentBookId);
    const bookName = currentBook?.book_name || currentBook?.name || '';
    return bookName;
  };

  // Obter slug do livro atual
  const getCurrentBookSlug = (): string => {
    return currentBookSlug;
  };

  return {
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
    getCurrentBookName,
    getCurrentBookSlug,
  };
}
