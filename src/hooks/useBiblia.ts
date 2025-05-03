
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Verse, Book, BibleVersion, DEFAULT_BIBLE_VERSION } from '@/types/biblia';
import { getBooks, getVersesByBookChapter, getBook, searchVerses } from '@/services/biblia';
import { createFavoriteKey, getFavoriteVerses } from '@/services/bibliaFavoritos';

// Hook para obter a lista de todos os livros disponíveis
export function useBooks() {
  return useQuery({
    queryKey: ['bible-books'],
    queryFn: getBooks,
  });
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
  version: BibleVersion = DEFAULT_BIBLE_VERSION
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
  const [version, setVersion] = useState<BibleVersion>(DEFAULT_BIBLE_VERSION);
  
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
