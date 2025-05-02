
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Verse } from '@/types/bible';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getBook } from '@/services/bibleQueryService';

interface SearchResultsProps {
  results: Verse[];
  searchQuery: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, searchQuery }) => {
  const { t } = useTranslation();
  
  // Create a map to batch fetch book data
  const bookIds = [...new Set(results.map(verse => verse.book_id.toString()))];

  // Fetch book data for all results at once
  const { data: booksData } = useQuery({
    queryKey: ['books', bookIds],
    queryFn: async () => {
      const bookPromises = bookIds.map(id => getBook(id));
      const books = await Promise.all(bookPromises);
      return books.reduce((acc, book, index) => {
        if (book) {
          acc[bookIds[index]] = book;
        }
        return acc;
      }, {} as Record<string, any>);
    },
    enabled: bookIds.length > 0
  });

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">{t('bible.noResultsFound')}</p>
          <p className="text-sm text-gray-400 mt-2">{t('bible.tryDifferentSearch')}</p>
        </CardContent>
      </Card>
    );
  }

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t('bible.searchResults')}</h2>
        <p className="text-sm text-gray-500">{results.length} {t('bible.resultsFound')}</p>
      </div>
      
      {results.map((verse) => {
        const book = booksData?.[verse.book_id];
        
        return (
          <Card key={verse.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">
                    {book?.title || t('bible.loading')} {verse.chapter}:{verse.verse}
                  </h3>
                </div>
                <p className="text-gray-700">
                  {highlightSearchTerm(verse.text, searchQuery)}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SearchResults;
