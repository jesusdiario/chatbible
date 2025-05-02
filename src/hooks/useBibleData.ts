
import { useQuery } from '@tanstack/react-query';
import { getBibleCategories, getBibleBooks, BibleCategory, BibleBook } from '@/services/bibleService';

// Mapa para corrigir slugs que não correspondem exatamente
const categorySlugMap: Record<string, string> = {
  'historico': 'historicos',
  'novo_testamento': 'novo-testamento',
  'cartas_paulinas': 'cartas-paulinas',
  'cartas_gerais': 'cartas-gerais',
  'apocalipse': 'apocalipse',
  'poetico': 'poeticos',
  'profetico': 'profeticos'
};

// Normaliza slugs para comparação
const normalizeSlug = (slug: string) => 
  slug?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const useBibleData = () => {
  const { 
    data: categories = [], 
    isLoading: catLoading, 
    isError: catError, 
    error: catErr 
  } = useQuery({
    queryKey: ['bible_categories'],
    queryFn: getBibleCategories
  });

  const { 
    data: books = [], 
    isLoading: booksLoading, 
    isError: booksError, 
    error: booksErr 
  } = useQuery({
    queryKey: ['bible_books'],
    queryFn: getBibleBooks
  });

  // Agrupa livros por categoria
  const booksByCategory: Record<string, BibleBook[]> = {};
  
  // Inicializa arrays vazios para todas as categorias
  categories.forEach(category => {
    const normalizedCategorySlug = normalizeSlug(category.slug);
    booksByCategory[normalizedCategorySlug] = [];
  });
  
  // Adiciona todos os livros às suas respectivas categorias
  books.forEach(book => {
    let normalizedCategorySlug = normalizeSlug(book.category_slug);
    
    // Aplica mapeamento se existir no dicionário de correção
    if (categorySlugMap[book.category_slug]) {
      normalizedCategorySlug = normalizeSlug(categorySlugMap[book.category_slug]);
    }
    
    if (!booksByCategory[normalizedCategorySlug]) {
      // Se a categoria ainda não existir no objeto, inicializa
      booksByCategory[normalizedCategorySlug] = [];
    }
    booksByCategory[normalizedCategorySlug].push(book);
  });

  // Adiciona logs para debug
  console.log("Categorias disponíveis:", categories.map(c => c.slug));
  console.log("Livros por categoria:", booksByCategory);
  console.log("Mapeamento de categoria:", categorySlugMap);

  // Ordena livros dentro de cada categoria por display_order
  Object.keys(booksByCategory).forEach(categorySlug => {
    booksByCategory[categorySlug].sort((a, b) => a.display_order - b.display_order);
  });

  return {
    categories,
    books,
    booksByCategory,
    isLoading: catLoading || booksLoading,
    isError: catError || booksError,
    error: catErr || booksErr
  };
};
