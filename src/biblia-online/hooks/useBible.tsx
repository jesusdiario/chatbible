
import { useState, useEffect } from 'react';
import { BibleService, Book, Chapter, BibleTranslation } from '@/services/bibleService';
import { useToast } from '@/hooks/use-toast';

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
        setIsLoading(true);
        const booksData = await BibleService.getBooks();
        setBooks(booksData);
        
        // Atualize o slug inicial se necessário
        if (booksData.length > 0) {
          const initialBook = booksData.find(book => book.id === currentBookId);
          if (initialBook && initialBook.slug !== currentBookSlug) {
            setCurrentBookSlug(initialBook.slug);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar livros:', error);
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
  }, [toast, currentBookId, currentBookSlug]);

  // Carregar capítulo atual
  useEffect(() => {
    const loadChapter = async () => {
      if (!currentBookId) return;
      
      try {
        setIsLoading(true);
        
        // Obter contagem de capítulos para o livro
        const count = await BibleService.getChapterCount(currentBookId);
        setChapterCount(count);
        
        // Ajustar capítulo se necessário (por exemplo, se mudarmos para um livro com menos capítulos)
        const adjustedChapter = Math.min(currentChapter, count || 1);
        if (adjustedChapter !== currentChapter) {
          setCurrentChapter(adjustedChapter);
          return; // Isso acionará outra chamada useEffect
        }
        
        // Carregar os dados do capítulo usando o slug para melhor SEO
        let chapter: Chapter | null = null;
        if (currentBookSlug) {
          chapter = await BibleService.getChapterBySlug(currentBookSlug, adjustedChapter);
        } else {
          chapter = await BibleService.getChapter(currentBookId, adjustedChapter);
        }
        
        setChapterData(chapter);
      } catch (error) {
        console.error('Erro ao carregar capítulo:', error);
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
    if (bookId !== currentBookId) {
      setCurrentBookId(bookId);
      if (bookSlug) {
        setCurrentBookSlug(bookSlug);
      } else {
        // Encontre o slug pelo ID
        const book = books.find(b => b.id === bookId);
        if (book) {
          setCurrentBookSlug(book.slug);
        }
      }
      setCurrentChapter(1); // Reiniciar para o capítulo 1 ao mudar de livros
    }
  };

  // Navegar para o capítulo anterior
  const goToPreviousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else {
      // Ir para o livro anterior, último capítulo
      const currentBookIndex = books.findIndex((book) => book.id === currentBookId);
      if (currentBookIndex > 0) {
        const previousBook = books[currentBookIndex - 1];
        navigateToBook(previousBook.id, previousBook.slug);
        setCurrentChapter(previousBook.chapter_count);
      }
    }
  };

  // Navegar para o próximo capítulo
  const goToNextChapter = () => {
    if (currentChapter < chapterCount) {
      setCurrentChapter(currentChapter + 1);
    } else {
      // Ir para o próximo livro, capítulo 1
      const currentBookIndex = books.findIndex((book) => book.id === currentBookId);
      if (currentBookIndex < books.length - 1) {
        const nextBook = books[currentBookIndex + 1];
        navigateToBook(nextBook.id, nextBook.slug);
        setCurrentChapter(1);
      }
    }
  };

  // Navegar para um capítulo específico
  const goToChapter = (chapter: number) => {
    if (chapter >= 1 && chapter <= chapterCount) {
      setCurrentChapter(chapter);
    }
  };

  // Alterar tradução
  const changeTranslation = (translation: BibleTranslation) => {
    setCurrentTranslation(translation);
  };

  // Obter nome do livro atual
  const getCurrentBookName = (): string => {
    const currentBook = books.find((book) => book.id === currentBookId);
    return currentBook?.book_name || currentBook?.name || '';
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
