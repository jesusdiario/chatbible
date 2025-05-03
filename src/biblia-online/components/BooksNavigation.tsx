
import React from 'react';
import { Book } from '../services/bibleService';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Search, Volume2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '../hooks/use-mobile';

interface BooksNavigationProps {
  books: Book[];
  currentBookId: number;
  onBookSelect: (bookId: number, bookSlug: string) => void;
  onClose: () => void;
}

export const BooksNavigation: React.FC<BooksNavigationProps> = ({
  books,
  currentBookId,
  onBookSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const isMobile = useIsMobile();
  
  const filteredBooks = React.useMemo(() => {
    if (!searchTerm.trim()) return books;
    
    const normalizedSearch = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return books.filter(book => {
      const normalizedBookName = book.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedBookName.includes(normalizedSearch);
    });
  }, [books, searchTerm]);

  const handleSelect = (bookId: number, bookSlug: string) => {
    onBookSelect(bookId, bookSlug);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center p-4 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-medium">Referências</h2>
        
        <div className="flex-1"></div>
        
        <Button variant="ghost" size="icon" className="ml-2">
          <span className="font-bold text-xl">AZ</span>
        </Button>
      </div>
      
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
          <Input
            placeholder="Pesquisar"
            className="pl-10 rounded-full bg-gray-100 border-0"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4 pb-8">
        <div className="space-y-6">
          {filteredBooks.map((book) => (
            <div key={book.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-lg font-medium hover:bg-gray-100"
                  onClick={() => handleSelect(book.id, book.slug)}
                >
                  {book.name}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
