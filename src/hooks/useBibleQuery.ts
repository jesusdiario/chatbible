
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getTestaments, 
  getBooksByTestament, 
  getBook, 
  getVersesByBookAndChapter, 
  getChapterCount,
  searchBible 
} from '@/services/bibleQueryService';

export function useBibleQuery() {
  const [selectedTestament, setSelectedTestament] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const testamentsQuery = useQuery({
    queryKey: ['testaments'],
    queryFn: getTestaments,
  });

  const booksQuery = useQuery({
    queryKey: ['books', selectedTestament],
    queryFn: () => selectedTestament ? getBooksByTestament(selectedTestament) : Promise.resolve([]),
    enabled: !!selectedTestament,
  });

  const bookQuery = useQuery({
    queryKey: ['book', selectedBook],
    queryFn: () => selectedBook ? getBook(selectedBook) : Promise.resolve(null),
    enabled: !!selectedBook,
  });

  const chapterCountQuery = useQuery({
    queryKey: ['chapterCount', selectedBook],
    queryFn: () => selectedBook ? getChapterCount(selectedBook) : Promise.resolve(0),
    enabled: !!selectedBook,
  });

  const versesQuery = useQuery({
    queryKey: ['verses', selectedBook, selectedChapter],
    queryFn: () => selectedBook ? getVersesByBookAndChapter(selectedBook, selectedChapter) : Promise.resolve([]),
    enabled: !!selectedBook && selectedChapter > 0,
  });

  const searchResultsQuery = useQuery({
    queryKey: ['search', searchQuery, selectedBook],
    queryFn: () => searchBible(searchQuery, selectedBook || undefined),
    enabled: searchQuery.length > 2,
  });

  return {
    testaments: testamentsQuery.data || [],
    books: booksQuery.data || [],
    book: bookQuery.data,
    chapterCount: chapterCountQuery.data || 0,
    verses: versesQuery.data || [],
    searchResults: searchResultsQuery.data || [],
    isLoadingTestaments: testamentsQuery.isLoading,
    isLoadingBooks: booksQuery.isLoading,
    isLoadingBook: bookQuery.isLoading,
    isLoadingVerses: versesQuery.isLoading,
    isLoadingSearch: searchResultsQuery.isLoading,
    setSelectedTestament,
    setSelectedBook,
    setSelectedChapter,
    setSearchQuery,
    selectedTestament,
    selectedBook,
    selectedChapter,
    searchQuery,
  };
}
