
import { useQuery } from '@tanstack/react-query';
import { getBooks, getTestaments, getVersesByBook, getBook, Book, Testament, Verse } from '@/services/biblia1Service';

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
  
  // Group books by testament
  const booksByTestament: { testament: Testament; books: Book[] }[] = [];
  
  if (books && testaments) {
    console.log('Books:', books.length, 'Testaments:', testaments.length);
    testaments.forEach(testament => {
      const testamentBooks = books.filter(book => book.testament_id === testament.id);
      if (testamentBooks.length > 0) {
        booksByTestament.push({ testament, books: testamentBooks });
      }
    });
  } else {
    console.log('Missing data:', { books, testaments });
  }
  
  return { booksByTestament, isLoading, error };
}

export function useBook(bookId: number) {
  const { data: book, isLoading, error } = useQuery({
    queryKey: ['bible-book', bookId],
    queryFn: () => getBook(bookId),
    enabled: !!bookId,
  });
  
  return { book, isLoading, error };
}

export function useVersesByBook(bookId: number) {
  const { data: verses, isLoading, error } = useQuery({
    queryKey: ['bible-verses', bookId],
    queryFn: () => getVersesByBook(bookId),
    enabled: !!bookId,
  });
  
  return { verses, isLoading, error };
}
