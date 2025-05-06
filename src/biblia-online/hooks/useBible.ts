import { useState, useEffect } from 'react';
import { BibleService, Book, Chapter, BibleTranslation } from '../services/bibleService';
import { useToast } from '@/hooks/use-toast';

// Função utilitária para ler valores do localStorage com fallback seguro
const getSavedValue = <T>(key: string, fallback: T): T => {
  try {
    if (typeof window === 'undefined') return fallback;
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
};

export function useBible() {
  const [books, setBooks] = useState<Book[]>([]);
  // Inicializar estados com valores do localStorage ou usar valores padrão
  const [currentBookId, setCurrentBookId] = useState<number>(
    getSavedValue('bible:lastBookId', 40) // Mateus como padrão
  );
  const [currentBookSlug, setCurrentBookSlug] = useState<string>(
    getSavedValue('bible:lastBookSlug', 'mateus')
  );
  const [currentChapter, setCurrentChapter] = useState<number>(
    getSavedValue('bible:lastChapter', 1)
  );
  const [currentTranslation, setCurrentTranslation] = useState<BibleTranslation>(
    getSavedValue('bible:lastTranslation', BibleTranslation.Default)
  );
  const [chapterData, setChapterData] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chapterCount, setChapterCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar lista de livros
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Carregando livros...');
        const booksData = await BibleService.getBooks();
        setBooks(booksData);
        console.log(`${booksData.length} livros carregados`);
        
        // Atualize o slug inicial se necessário
        if (booksData.length > 0) {
          const initialBook = booksData.find(book => book.id === currentBookId);
          if (initialBook && initialBook.slug !== currentBookSlug) {
            console.log(`Atualizando slug de livro inicial para ${initialBook.slug}`);
            setCurrentBookSlug(initialBook.slug);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar livros:', error);
        setError('Falha ao carregar os livros da Bíblia');
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
      if (!currentBookId) {
        console.log('BookID não definido, pulando carregamento de capítulo');
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Carregando capítulo ${currentChapter} do livro ID ${currentBookId} (slug: ${currentBookSlug})...`);
        
        // Obter contagem de capítulos para o livro
        const count = await BibleService.getChapterCount(currentBookId);
        console.log(`Contagem de capítulos para o livro ${currentBookId}: ${count}`);
        setChapterCount(count);
        
        // Ajustar capítulo se necessário (por exemplo, se mudarmos para um livro com menos capítulos)
        const adjustedChapter = Math.min(currentChapter, count || 1);
        if (adjustedChapter !== currentChapter) {
          console.log(`Ajustando capítulo de ${currentChapter} para ${adjustedChapter}`);
          setCurrentChapter(adjustedChapter);
          return; // Isso acionará outra chamada useEffect
        }
        
        // Carregar os dados do capítulo usando o slug para melhor SEO
        let chapter: Chapter | null = null;
        if (currentBookSlug) {
          console.log(`Usando slug '${currentBookSlug}' para carregar o capítulo ${adjustedChapter}`);
          chapter = await BibleService.getChapterBySlug(currentBookSlug, adjustedChapter);
        } else {
          console.log(`Usando bookID ${currentBookId} para carregar o capítulo ${adjustedChapter}`);
          chapter = await BibleService.getChapter(currentBookId, adjustedChapter);
        }
        
        if (chapter) {
          console.log(`Capítulo carregado: ${chapter.book_name} ${chapter.chapter} com ${chapter.verses.length} versículos`);
          setChapterData(chapter);
        } else {
          console.log(`Nenhum capítulo encontrado para ${currentBookSlug || currentBookId} capítulo ${adjustedChapter}`);
          setChapterData(null);
          setError('Capítulo não encontrado');
        }
      } catch (error) {
        console.error('Erro ao carregar capítulo:', error);
        setError('Falha ao carregar o capítulo');
        setChapterData(null);
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

  // Persistir dados de navegação no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bible:lastBookId', JSON.stringify(currentBookId));
      localStorage.setItem('bible:lastBookSlug', JSON.stringify(currentBookSlug));
      localStorage.setItem('bible:lastChapter', JSON.stringify(currentChapter));
      localStorage.setItem('bible:lastTranslation', JSON.stringify(currentTranslation));
      console.log('Progresso de leitura salvo:', {
        bookId: currentBookId,
        bookSlug: currentBookSlug,
        chapter: currentChapter,
        translation: currentTranslation
      });
    } catch (error) {
      console.warn('Não foi possível persistir o progresso de leitura', error);
    }
  }, [currentBookId, currentBookSlug, currentChapter, currentTranslation]);

  // Navegar para outro livro
  const navigateToBook = (bookId: number, bookSlug?: string) => {
    console.log(`Navegando para livro ID ${bookId}${bookSlug ? `, slug: ${bookSlug}` : ''}...`);
    if (bookId !== currentBookId) {
      setCurrentBookId(bookId);
      if (bookSlug) {
        setCurrentBookSlug(bookSlug);
      } else {
        // Encontre o slug pelo ID
        const book = books.find(b => b.id === bookId);
        if (book) {
          console.log(`Encontrado slug para o livro ID ${bookId}: ${book.slug}`);
          setCurrentBookSlug(book.slug);
        }
      }
      setCurrentChapter(1); // Reiniciar para o capítulo 1 ao mudar de livros
    }
  };

  // Navegar para o capítulo anterior
  const goToPreviousChapter = () => {
    console.log('Navegando para o capítulo anterior...');
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
      console.log(`Definindo capítulo para ${currentChapter - 1}`);
    } else {
      // Ir para o livro anterior, último capítulo
      const currentBookIndex = books.findIndex((book) => book.id === currentBookId);
      if (currentBookIndex > 0) {
        const previousBook = books[currentBookIndex - 1];
        console.log(`Indo para o livro anterior: ${previousBook.name}, ID ${previousBook.id}`);
        navigateToBook(previousBook.id, previousBook.slug);
        setCurrentChapter(previousBook.chapter_count);
        console.log(`Definindo capítulo para ${previousBook.chapter_count} (último do livro anterior)`);
      }
    }
  };

  // Navegar para o próximo capítulo
  const goToNextChapter = () => {
    console.log('Navegando para o próximo capítulo...');
    if (currentChapter < chapterCount) {
      setCurrentChapter(currentChapter + 1);
      console.log(`Definindo capítulo para ${currentChapter + 1}`);
    } else {
      // Ir para o próximo livro, capítulo 1
      const currentBookIndex = books.findIndex((book) => book.id === currentBookId);
      if (currentBookIndex < books.length - 1) {
        const nextBook = books[currentBookIndex + 1];
        console.log(`Indo para o próximo livro: ${nextBook.name}, ID ${nextBook.id}`);
        navigateToBook(nextBook.id, nextBook.slug);
        setCurrentChapter(1);
        console.log('Definindo capítulo para 1');
      }
    }
  };

  // Navegar para um capítulo específico
  const goToChapter = (chapter: number) => {
    console.log(`Navegando para o capítulo ${chapter}...`);
    if (chapter >= 1 && chapter <= chapterCount) {
      setCurrentChapter(chapter);
    }
  };

  // Alterar tradução
  const changeTranslation = (translation: BibleTranslation) => {
    console.log(`Alterando tradução para ${translation}`);
    setCurrentTranslation(translation);
  };

  // Obter nome do livro atual
  const getCurrentBookName = (): string => {
    const currentBook = books.find((book) => book.id === currentBookId);
    return currentBook?.name || '';
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
    error,
    navigateToBook,
    goToPreviousChapter,
    goToNextChapter,
    goToChapter,
    changeTranslation,
    getCurrentBookName,
    getCurrentBookSlug,
  };
}
