
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BibleBook } from '@/types/bible';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BookSelectorProps {
  books: BibleBook[];
  selectedBook: string | null;
  onBookSelect: (bookId: string) => void;
}

const BookSelector: React.FC<BookSelectorProps> = ({
  books,
  selectedBook,
  onBookSelect,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">{t('bible.selectBook')}</h2>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {books.map((book) => (
              <Button
                key={book.slug}
                variant={selectedBook === book.slug ? "default" : "outline"}
                onClick={() => onBookSelect(book.slug)}
                className="w-full justify-start text-left overflow-hidden text-ellipsis whitespace-nowrap"
              >
                {book.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default BookSelector;
