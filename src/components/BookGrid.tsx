
import React from 'react';
import { Link } from 'react-router-dom';
import { BibleBook } from '@/services/bibleService';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface BookGridProps {
  books: BibleBook[];
}

export const BookGrid: React.FC<BookGridProps> = ({ books }) => {
  const useCarousel = books.length > 6;

  if (useCarousel) {
    return (
      <div className="relative">
        <div className="overflow-hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {books.map((book) => (
                <CarouselItem key={book.slug} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/4 lg:basis-1/6">
                  <BookCard book={book} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 z-10" />
          </Carousel>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      {books.map((book) => (
        <BookCard key={book.slug} book={book} />
      ))}
    </div>
  );
};

const BookCard: React.FC<{ book: BibleBook }> = ({ book }) => (
  <Link
    to={`/livros-da-biblia/${book.slug}`}
    className="block group"
  >
    <AspectRatio ratio={852/1185} className="bg-chatgpt-secondary rounded-lg overflow-hidden">
      <img
        src={book.image_url || `/images/covers/${book.slug}.jpg`}
        alt={`Capa de ${book.title}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/images/covers/default.jpg";
        }}
      />
    </AspectRatio>
    <div className="p-2">
      <span className="text-sm font-medium">{book.title}</span>
    </div>
  </Link>
);
