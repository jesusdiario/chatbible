import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Verse, Book, BibleVersion } from '@/types/biblia';
import { 
  getBooks, 
  getTestaments, 
  getVersesByBookChapter, 
  getBook, 
  searchVerses 
} from '@/services/bibliaAPI';
import { 
  createFavoriteKey, 
  getFavoriteVerses 
} from '@/services/bibliaFavoritos';

// Hook para obter a lista de livros
export function useBooks() {
  return useQuery({
    queryKey: ['bible-books'],
    queryFn: getBooks,
  });
}

// Hook para obter a lista de testamentos
export function useTestaments() {
  return useQuery({
    queryKey: ['bible-testaments'],
    queryFn: getTestaments,
  });
}

// Hook para agrupar os livros por testamento
export function useBooksByTestament() {
  const { data: books, isLoading: booksLoading, error: booksError } = useBooks();
  const { data: testaments, isLoading: testamentsLoading, error: testamentsError } = useTestaments();
  
  const isLoading = booksLoading || testamentsLoading;
  const error = booksError || testamentsError;
  
  // Agrupar livros por testamento
  const booksByTestament = [];
  
  if (books && testaments) {
    testaments.forEach(testament => {
      const testamentBooks = books.filter(book => {
        return testament.id === 'vt' ? 
          Number(book.id) < 40 : 
          Number(book.id) >= 40;
      });
      
      if (testamentBooks.length > 0) {
        booksByTestament.push({ testament, books: testamentBooks });
      }
    });
  }
  
  // Log para debug
  console.log("Books loaded:", books?.length || 0);
  console.log("Testaments loaded:", testaments?.length || 0);
  console.log("Books by testament:", booksByTestament);
  
  return { booksByTestament, isLoading, error };
}

// Hook para obter detalhes de um livro específico
export function useBook(bookId: string | number) {
  return useQuery({
    queryKey: ['bible-book', bookId],
    queryFn: () => getBook(bookId),
    enabled: !!bookId,
  });
}

// Hook para obter versículos de um livro e capítulo específicos
export function useVersesByBookChapter(
  bookId: string | number, 
  chapter: string | number, 
  version: BibleVersion = 'acf'
) {
  return useQuery({
    queryKey: ['bible-verses', bookId, chapter, version],
    queryFn: () => getVersesByBookChapter(bookId, chapter, version),
    enabled: !!bookId && !!chapter,
  });
}

// Hook para pesquisa de versículos
export function useBibleSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [version, setVersion] = useState<BibleVersion>('acf');
  
  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['bible-search', searchTerm, version],
    queryFn: () => searchVerses(searchTerm, version),
    enabled: searchTerm.length >= 3, // Só busca se tiver pelo menos 3 caracteres
  });
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length >= 3) {
      refetch();
    }
  };
  
  return {
    searchTerm,
    setSearchTerm: handleSearch,
    version,
    setVersion,
    searchResults,
    isLoading,
    error
  };
}

// Hook para gerenciar versículos favoritos
export function useBibleFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Carregar favoritos do localStorage quando o componente montar
  useEffect(() => {
    const saved = localStorage.getItem('bible-favorites');
    if (saved) {
      try {
        const parsedFavorites = JSON.parse(saved);
        setFavorites(parsedFavorites);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        localStorage.removeItem('bible-favorites');
      }
    }
  }, []);
  
  const addFavorite = (verse: Verse) => {
    try {
      const favoriteKey = createFavoriteKey(verse);
      
      if (!favorites.includes(favoriteKey)) {
        const newFavorites = [...favorites, favoriteKey];
        setFavorites(newFavorites);
        localStorage.setItem('bible-favorites', JSON.stringify(newFavorites));
      }
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
    }
  };
  
  const removeFavorite = (verse: Verse) => {
    try {
      const favoriteKey = createFavoriteKey(verse);
      
      const newFavorites = favorites.filter(f => f !== favoriteKey);
      setFavorites(newFavorites);
      localStorage.setItem('bible-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  };
  
  const isFavorite = (verse: Verse) => {
    try {
      const favoriteKey = createFavoriteKey(verse);
      return favorites.includes(favoriteKey);
    } catch {
      return false;
    }
  };
  
  // Hook para carregar os dados dos favoritos
  const useFavoritesData = () => {
    return useQuery({
      queryKey: ['bible-favorites', favorites],
      queryFn: () => getFavoriteVerses(favorites),
      enabled: favorites.length > 0,
    });
  };
  
  return { 
    favorites, 
    addFavorite, 
    removeFavorite, 
    isFavorite,
    useFavoritesData
  };
}
