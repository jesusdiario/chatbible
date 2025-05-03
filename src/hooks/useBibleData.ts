
import { useState, useEffect } from 'react';
import { useBibleBooks } from './bible/useBibleBooks';
import { useBibleChapter } from './bible/useBibleChapter';
import { useBibleNavigation } from './bible/useBibleNavigation';
import { useBibleFavorites } from './bible/useBibleFavorites';
import { BibleBook } from '@/types/biblia';

// Interface para categorias 
interface Category {
  slug: string;
  title: string;
  description?: string;
}

export function useBibleData() {
  // Composição de hooks
  const { books, loading: loadingBooks, error: booksError } = useBibleBooks();
  const { currentBook, currentChapter, selectBook, navigateToChapter, nextChapter, previousChapter, initializeBook } = 
    useBibleNavigation(books, 0);
  const { chapterCount, verses, loading: loadingVerses, error: versesError } = 
    useBibleChapter(currentBook, currentChapter);
  
  // Estados adicionais para categorias e organização de livros por categoria
  const [categories, setCategories] = useState<Category[]>([]);
  const [booksByCategory, setBooksByCategory] = useState<Record<string, BibleBook[]>>({});
  
  // Inicializar o livro atual quando os livros são carregados
  useEffect(() => {
    initializeBook(books);
  }, [books]);

  // Organizar livros por categoria
  useEffect(() => {
    if (books.length > 0) {
      // Criar conjunto único de categorias
      const uniqueCategories = Array.from(new Set(books.map(book => book.category_slug)));
      
      // Criar objetos de categoria
      const cats = uniqueCategories.map(slug => ({
        slug,
        title: getCategoryTitle(slug),
        description: ''
      }));
      
      // Organizar livros por categoria
      const booksByCat: Record<string, BibleBook[]> = {};
      uniqueCategories.forEach(cat => {
        booksByCat[cat] = books.filter(book => book.category_slug === cat);
      });
      
      setCategories(cats);
      setBooksByCategory(booksByCat);
    }
  }, [books]);
  
  // Função auxiliar para obter título da categoria a partir do slug
  const getCategoryTitle = (slug: string): string => {
    const titles: Record<string, string> = {
      'pentateuco': 'Pentateuco',
      'historico': 'Históricos',
      'poetico': 'Poéticos',
      'profetico': 'Proféticos',
      'novo_testamento': 'Novo Testamento',
      'cartas_paulinas': 'Cartas Paulinas',
      'cartas_gerais': 'Cartas Gerais',
      'apocalipse': 'Apocalipse',
      'temas': 'Temas Bíblicos',
      'teologia': 'Teologia'
    };
    
    return titles[slug] || slug;
  };

  // Exportamos o objeto de favoritos diretamente
  const bibleFavorites = useBibleFavorites();

  // Estado consolidado
  const loading = loadingBooks || loadingVerses;
  const error = booksError || versesError;
  
  // Flag para indicar se houve erro
  const isError = !!error;
  const isLoading = loading;

  return {
    // Dados
    books,
    currentBook,
    currentChapter,
    chapterCount,
    verses,
    
    // Categorias e organizações
    categories,
    booksByCategory,
    
    // Estado
    loading,
    isLoading,
    error,
    isError,
    
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
