
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Book } from 'lucide-react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBibleQuery } from '@/hooks/useBibleQuery';
import { Verse } from '@/types/bible';
import TestamentSelector from '@/components/biblia-consulta/TestamentSelector';
import BookSelector from '@/components/biblia-consulta/BookSelector';
import ChapterSelector from '@/components/biblia-consulta/ChapterSelector';
import VerseList from '@/components/biblia-consulta/VerseList';
import SearchResults from '@/components/biblia-consulta/SearchResults';

const BibliaConsulta: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('read');
  const {
    testaments,
    books,
    verses,
    chapterCount,
    searchResults,
    isLoadingTestaments,
    isLoadingBooks,
    isLoadingVerses,
    isLoadingSearch,
    setSelectedTestament,
    setSelectedBook,
    setSelectedChapter,
    setSearchQuery,
    selectedTestament,
    selectedBook,
    selectedChapter,
    searchQuery,
  } = useBibleQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const query = formData.get('search') as string;
    if (query && query.length > 2) {
      setSearchQuery(query);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('bible.bibleBooks')}</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="read" className="flex-1">
              <Book className="mr-2 h-4 w-4" />
              {t('bible.read')}
            </TabsTrigger>
            <TabsTrigger value="search" className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              {t('bible.search')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="read">
            <div className="space-y-6">
              {isLoadingTestaments ? (
                <LoadingSpinner />
              ) : (
                <TestamentSelector 
                  testaments={testaments}
                  selectedTestament={selectedTestament}
                  onTestamentSelect={setSelectedTestament}
                />
              )}
              
              {selectedTestament && (
                isLoadingBooks ? (
                  <LoadingSpinner />
                ) : (
                  <BookSelector 
                    books={books}
                    selectedBook={selectedBook}
                    onBookSelect={setSelectedBook}
                  />
                )
              )}
              
              {selectedBook && (
                <ChapterSelector 
                  chapterCount={chapterCount}
                  selectedChapter={selectedChapter}
                  onChapterSelect={setSelectedChapter}
                />
              )}
              
              {selectedBook && selectedChapter > 0 && (
                isLoadingVerses ? (
                  <LoadingSpinner />
                ) : (
                  <VerseList verses={verses} />
                )
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="search">
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <Input 
                  name="search"
                  placeholder={t('bible.searchPlaceholder')}
                  className="flex-1"
                  defaultValue={searchQuery}
                />
                <Button type="submit" disabled={isLoadingSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  {t('common.search')}
                </Button>
              </div>
            </form>
            
            {isLoadingSearch ? (
              <LoadingSpinner />
            ) : searchQuery && (
              <SearchResults results={searchResults} searchQuery={searchQuery} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default BibliaConsulta;
