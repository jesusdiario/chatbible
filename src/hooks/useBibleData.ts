
import { useEffect } from 'react';
import { useBibleBooks } from './bible/useBibleBooks';
import { useBibleChapter } from './bible/useBibleChapter';
import { useBibleNavigation } from './bible/useBibleNavigation';
import { useBibleFavorites } from './bible/useBibleFavorites';

export function useBibleData() {
  // Composição de hooks
  const { books, loading: loadingBooks, error: booksError } = useBibleBooks();
  const { currentBook, currentChapter, selectBook, navigateToChapter, nextChapter, previousChapter, initializeBook } = 
    useBibleNavigation(books, 0);
  const { chapterCount, verses, loading: loadingVerses, error: versesError } = 
    useBibleChapter(currentBook, currentChapter);
  
  // Inicializar o livro atual quando os livros são carregados
  useEffect(() => {
    initializeBook(books);
  }, [books]);

  // Exportamos o objeto de favoritos diretamente
  const bibleFavorites = useBibleFavorites();

  // Estado consolidado
  const loading = loadingBooks || loadingVerses;
  const error = booksError || versesError;

  return {
    // Dados
    books,
    currentBook,
    currentChapter,
    chapterCount,
    verses,
    
    // Estado
    loading,
    error,
    
    // Ações
    selectBook,
    navigateToChapter,
    nextChapter,
    previousChapter,
    
    // Favoritos
    ...bibleFavorites
  };
}

// Re-exportamos o hook de favoritos para manter compatibilidade com o código existente
export { useBibleFavorites } from './bible/useBibleFavorites';
