
import { useQuery } from '@tanstack/react-query';
import { getBooks, getTestaments, getVersesByBookChapter, getBook, searchVerses, BibleVersion, Book, Verse } from '@/services/bibliaService';
import { useState } from 'react';

export function useBooks() {
  return useQuery({
    queryKey: ['bible-books'],
    queryFn: getBooks,
  });
}

export function useTestaments() {
  return useQuery({
    queryKey: ['bible-testaments'],
    queryFn: getTestaments,
  });
}

export function useBooksByTestament() {
  const { data: books, isLoading: booksLoading, error: booksError } = useBooks();
  const { data: testaments, isLoading: testamentsLoading, error: testamentsError } = useTestaments();
  
  const isLoading = booksLoading || testamentsLoading;
  const error = booksError || testamentsError;
  
  // Agrupar livros por testamento
  const booksByTestament: { testament: { id: string, name: string }; books: Book[] }[] = [];
  
  if (books && testaments) {
    testaments.forEach(testament => {
      const testamentBooks = books.filter(book => {
        const prefix = book.id.split('.')[0];
        return testament.id === prefix;
      });
      
      if (testamentBooks.length > 0) {
        booksByTestament.push({ testament, books: testamentBooks });
      }
    });
  }
  
  return { booksByTestament, isLoading, error };
}

export function useBook(bookId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bible-book', bookId],
    queryFn: () => getBook(bookId),
    enabled: !!bookId,
  });
  
  return { data, isLoading, error };
}

export function useVersesByBookChapter(bookId: string, chapter: string, version: BibleVersion = 'acf') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bible-verses', bookId, chapter, version],
    queryFn: () => getVersesByBookChapter(bookId, chapter, version),
    enabled: !!bookId && !!chapter,
  });
  
  return { data, isLoading, error };
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
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('bible-favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  const addFavorite = (verse: Verse) => {
    const favoriteKey = `${verse.book_id}:${verse.chapter}:${verse.verse}`;
    if (!favorites.includes(favoriteKey)) {
      const newFavorites = [...favorites, favoriteKey];
      setFavorites(newFavorites);
      localStorage.setItem('bible-favorites', JSON.stringify(newFavorites));
    }
  };
  
  const removeFavorite = (verse: Verse) => {
    const favoriteKey = `${verse.book_id}:${verse.chapter}:${verse.verse}`;
    const newFavorites = favorites.filter(f => f !== favoriteKey);
    setFavorites(newFavorites);
    localStorage.setItem('bible-favorites', JSON.stringify(newFavorites));
  };
  
  const isFavorite = (verse: Verse) => {
    const favoriteKey = `${verse.book_id}:${verse.chapter}:${verse.verse}`;
    return favorites.includes(favoriteKey);
  };
  
  return { favorites, addFavorite, removeFavorite, isFavorite };
}
