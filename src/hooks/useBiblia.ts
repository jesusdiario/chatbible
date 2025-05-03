
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BibleBook, Verse } from '@/types/biblia';
import { getBibleBooks, getBookChapters, getChapterVerses } from '@/services/biblia';
import { isFavoriteVerse, saveFavoriteVerse, removeFavoriteVerse } from '@/services/bibliaFavoritos';

export function useBibleData() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentBook, setCurrentBook] = useState<BibleBook | null>(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterCount, setChapterCount] = useState(0);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar lista de livros
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const booksData = await getBibleBooks();
        setBooks(booksData);
        
        // Inicialmente, selecione o primeiro livro
        if (booksData.length > 0 && !currentBook) {
          setCurrentBook(booksData[0]);
        }
      } catch (err) {
        setError('Erro ao carregar livros da Bíblia');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os livros da Bíblia',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Ao mudar o livro atual, carregar contagem de capítulos
  useEffect(() => {
    const loadChapterCount = async () => {
      if (!currentBook?.id) return;
      
      try {
        const count = await getBookChapters(currentBook.id);
        setChapterCount(count);
        
        // Se o capítulo atual excede o número de capítulos, ajuste-o
        if (currentChapter > count) {
          setCurrentChapter(1);
        }
      } catch (err) {
        setError('Erro ao carregar capítulos');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os capítulos',
          variant: 'destructive',
        });
      }
    };

    loadChapterCount();
  }, [currentBook]);

  // Ao mudar o livro ou capítulo, carregar versículos
  useEffect(() => {
    const loadVerses = async () => {
      if (!currentBook?.id) return;
      
      try {
        setLoading(true);
        const result = await getChapterVerses(currentBook.id, currentChapter);
        if (result) {
          setVerses(result.verses);
          setError(null);
        } else {
          setVerses([]);
          setError('Nenhum versículo encontrado');
        }
      } catch (err) {
        setVerses([]);
        setError('Erro ao carregar versículos');
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os versículos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadVerses();
  }, [currentBook, currentChapter]);

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
        getBookChapters(prevBook.id).then(count => {
          setCurrentChapter(count);
        });
      }
    }
  };

  return {
    books,
    currentBook,
    currentChapter,
    chapterCount,
    verses,
    loading,
    error,
    selectBook,
    navigateToChapter,
    nextChapter,
    previousChapter
  };
}

export function useBibleFavorites() {
  const { toast } = useToast();

  const addFavorite = async (verse: Verse) => {
    try {
      await saveFavoriteVerse(verse);
      toast({
        title: 'Versículo salvo',
        description: 'Versículo adicionado aos seus favoritos'
      });
      return true;
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o versículo',
        variant: 'destructive'
      });
      return false;
    }
  };

  const removeFavorite = async (verse: Verse) => {
    try {
      if (!verse.id) throw new Error('ID do versículo é necessário');
      await removeFavoriteVerse(verse.id);
      toast({
        title: 'Versículo removido',
        description: 'Versículo removido dos seus favoritos'
      });
      return true;
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o versículo',
        variant: 'destructive'
      });
      return false;
    }
  };

  const isFavorite = async (verse: Verse) => {
    if (!verse.book_id || !verse.chapter || !verse.verse) return false;
    return await isFavoriteVerse(verse.book_id, verse.chapter, verse.verse);
  };

  return {
    addFavorite,
    removeFavorite,
    isFavorite
  };
}
