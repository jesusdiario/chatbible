
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getBibleCategories, getBibleBooks, BibleCategory, BibleBook } from "@/services/bibleService";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const LivrosDaBiblia = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  // Fetch categories
  const { data: categories = [], isLoading: catLoading, isError: catError, error: catErr } = useQuery({
    queryKey: ['bible_categories'],
    queryFn: getBibleCategories
  });

  // Fetch books
  const { data: books = [], isLoading: booksLoading, isError: booksError, error: booksErr } = useQuery({
    queryKey: ['bible_books'],
    queryFn: getBibleBooks
  });

  // Group books by category
  const booksByCategory: Record<string, BibleBook[]> = {};
  books.forEach(book => {
    if (!book.category_slug) return;
    if (!booksByCategory[book.category_slug]) {
      booksByCategory[book.category_slug] = [];
    }
    booksByCategory[book.category_slug].push(book);
  });

  // Ensure books are sorted by display_order within each category
  categories.forEach(cat => {
    if (booksByCategory[cat.slug]) {
      booksByCategory[cat.slug].sort((a, b) => a.display_order - b.display_order);
    }
  });

  if (catError || booksError) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          onApiKeyChange={handleApiKeyChange}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <ChatHeader 
            isSidebarOpen={isSidebarOpen} 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-white min-h-screen">
            <div className="p-4 bg-red-900 rounded">
              <p className="font-bold">Falha ao carregar dados:</p>
              <pre className="mt-2 overflow-auto text-sm">{JSON.stringify(catErr || booksErr, null, 2)}</pre>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const renderBookList = (categoryBooks: BibleBook[]) => {
    const useCarousel = categoryBooks.length > 4;

    if (useCarousel) {
      return (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {categoryBooks.map((book) => (
              <CarouselItem key={book.slug} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4">
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {categoryBooks.map((book) => (
          <Link
            key={book.slug}
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
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        onApiKeyChange={handleApiKeyChange}
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div className="pt-[60px] pb-4 px-4 md:px-8 bg-chatgpt-main text-white min-h-screen">
          {(catLoading || booksLoading) ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            categories.map(category => {
              const categoryBooks = booksByCategory[category.slug] || [];
              if (categoryBooks.length === 0) return null;
              
              return (
                <section key={category.slug} className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-4">{category.title}</h2>
                  {renderBookList(categoryBooks)}
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;
