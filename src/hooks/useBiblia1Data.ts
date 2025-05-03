
import { useQuery } from '@tanstack/react-query';
import { getBooks, getTestaments, getVersesByBook, getBook, searchVerses, Book, Testament, Verse, FavoriteItem } from '@/services/biblia1Service';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Hook para buscar todos os livros
export function useBooks() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['bible-books'],
    queryFn: async () => {
      try {
        return await getBooks();
      } catch (error) {
        console.error('Erro ao buscar livros:', error);
        toast({
          title: "Erro ao carregar livros",
          description: "Não foi possível buscar os livros da Bíblia",
          variant: "destructive",
        });
        return [];
      }
    },
  });
}

// Hook para buscar todos os testamentos
export function useTestaments() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['bible-testaments'],
    queryFn: async () => {
      try {
        return await getTestaments();
      } catch (error) {
        console.error('Erro ao buscar testamentos:', error);
        toast({
          title: "Erro ao carregar testamentos",
          description: "Não foi possível buscar os testamentos da Bíblia",
          variant: "destructive",
        });
        return [];
      }
    },
  });
}

// Hook para buscar livros organizados por testamento
export function useBooksByTestament() {
  const { data: books, isLoading: booksLoading, error: booksError } = useBooks();
  const { data: testaments, isLoading: testamentsLoading, error: testamentsError } = useTestaments();
  const { toast } = useToast();
  
  const isLoading = booksLoading || testamentsLoading;
  const error = booksError || testamentsError;
  
  // Organiza os livros por testamento
  const booksByTestament: { testament: Testament; books: Book[] }[] = [];
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Houve um problema ao buscar os dados da Bíblia",
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  if (books && testaments) {
    console.log('Livros:', books.length, 'Testamentos:', testaments.length);
    testaments.forEach(testament => {
      const testamentBooks = books.filter(book => book.testament_id === testament.id);
      if (testamentBooks.length > 0) {
        booksByTestament.push({ testament, books: testamentBooks });
      }
    });
  } else {
    console.log('Dados faltantes:', { books, testaments });
  }
  
  return { booksByTestament, isLoading, error };
}

// Hook para buscar informações de um livro específico
export function useBook(bookId: number) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['bible-book', bookId],
    queryFn: async () => {
      try {
        return await getBook(bookId);
      } catch (error) {
        console.error(`Erro ao buscar livro ${bookId}:`, error);
        toast({
          title: "Erro ao carregar livro",
          description: "Não foi possível buscar os dados deste livro",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!bookId,
  });
}

// Hook para buscar versículos de um livro específico
export function useVersesByBook(bookId: number) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['bible-verses', bookId],
    queryFn: async () => {
      try {
        return await getVersesByBook(bookId);
      } catch (error) {
        console.error(`Erro ao buscar versículos do livro ${bookId}:`, error);
        toast({
          title: "Erro ao carregar versículos",
          description: "Não foi possível buscar os versículos deste livro",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!bookId,
  });
}

// Novo hook para busca de versículos por palavra-chave
export function useSearchVerses(query: string) {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  
  const result = useQuery({
    queryKey: ['bible-search', query],
    queryFn: async () => {
      setIsSearching(true);
      try {
        const results = await searchVerses(query);
        return results;
      } catch (error) {
        console.error('Erro na busca de versículos:', error);
        toast({
          title: "Erro na busca",
          description: "Não foi possível completar a busca por versículos",
          variant: "destructive",
        });
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    enabled: query.length >= 3,
  });
  
  return { ...result, isSearching };
}

// Novo hook para gerenciar favoritos
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { toast } = useToast();
  
  // Carrega favoritos ao montar o componente
  useEffect(() => {
    const loadedFavorites = localStorage.getItem('bible-favorites');
    if (loadedFavorites) {
      try {
        setFavorites(JSON.parse(loadedFavorites));
      } catch (e) {
        console.error('Erro ao carregar favoritos:', e);
        localStorage.removeItem('bible-favorites');
      }
    }
  }, []);
  
  // Salva favoritos quando mudam
  useEffect(() => {
    localStorage.setItem('bible-favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  const addFavorite = (favorite: FavoriteItem) => {
    setFavorites(prev => {
      // Verifica se já existe um favorito com mesmo livro, capítulo e versículo
      const exists = prev.some(item => 
        item.bookId === favorite.bookId && 
        item.chapter === favorite.chapter &&
        item.verse === favorite.verse
      );
      
      if (exists) {
        toast({
          title: "Já favoritado",
          description: "Este versículo já está nos seus favoritos",
        });
        return prev;
      }
      
      toast({
        title: "Adicionado aos favoritos",
        description: `${favorite.bookName} ${favorite.chapter}:${favorite.verse || 'Todo o capítulo'}`,
      });
      
      return [...prev, favorite];
    });
  };
  
  const removeFavorite = (favorite: FavoriteItem) => {
    setFavorites(prev => {
      const newFavorites = prev.filter(item => 
        !(item.bookId === favorite.bookId && 
          item.chapter === favorite.chapter &&
          item.verse === favorite.verse)
      );
      
      toast({
        title: "Removido dos favoritos",
        description: `${favorite.bookName} ${favorite.chapter}:${favorite.verse || 'Todo o capítulo'}`,
      });
      
      return newFavorites;
    });
  };
  
  const isFavorite = (bookId: number, chapter: number, verse?: number) => {
    return favorites.some(item => 
      item.bookId === bookId && 
      item.chapter === chapter &&
      (verse ? item.verse === verse : !item.verse)
    );
  };
  
  return { favorites, addFavorite, removeFavorite, isFavorite };
}
