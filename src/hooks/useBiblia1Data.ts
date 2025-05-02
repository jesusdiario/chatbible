
import { useQuery } from '@tanstack/react-query';
import { getBooks, getTestaments, Book, Testament } from '@/services/biblia1Service';

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
  const booksByTestament: { testament: Testament; books: Book[] }[] = [];
  
  if (books && testaments) {
    testaments.forEach(testament => {
      const testamentBooks = books.filter(book => book.testament_id === testament.id);
      if (testamentBooks.length > 0) {
        booksByTestament.push({ testament, books: testamentBooks });
      }
    });
  }
  
  return { booksByTestament, isLoading, error };
}
