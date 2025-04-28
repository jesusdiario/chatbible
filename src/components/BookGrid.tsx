
import React from 'react';
import { Link } from 'react-router-dom';
import { BibleBook } from '@/services/bibleService';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface BookGridProps {
  books: BibleBook[];
}

export const BookGrid: React.FC<BookGridProps> = ({ books }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => (
        <Link
          to={`/livros-da-biblia/${book.slug}`}
          key={book.slug}
          className="block group"
        >
          <Card className="overflow-hidden hover:border-primary transition-colors">
            <CardContent className="p-4 flex items-center space-x-4">
              <Avatar className="h-16 w-16 rounded-full">
                <AvatarImage
                  src={book.image_url || `/images/covers/${book.slug}.jpg`}
                  alt={`Capa de ${book.title}`}
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/covers/default.jpg";
                  }}
                />
                <AvatarFallback>{book.title.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">{book.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">Explore este livro bíblico</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
