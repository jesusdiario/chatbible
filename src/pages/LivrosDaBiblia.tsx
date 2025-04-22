
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
import { Card, CardContent } from "@/components/ui/card";

const LivrosDaBiblia = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  // Fetch categories and books
  const { data: categories = [], isLoading: catLoading, isError: catError, error: catErr } = useQuery({
    queryKey: ['bible_categories'],
    queryFn: getBibleCategories
  });

  const { data: books = [], isLoading: booksLoading, isError: booksError, error: booksErr } = useQuery({
    queryKey: ['bible_books'],
    queryFn: getBibleBooks
  });

  // Normalize slugs for comparison
  const normalizeSlug = (slug: string) => 
    slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // Group books by category with normalized slugs
  const booksByCategory: Record<string, BibleBook[]> = {};
  books.forEach(book => {
    const normalizedCategorySlug = normalizeSlug(book.category_slug);
    if (!booksByCategory[normalizedCategorySlug]) {
      booksByCategory[normalizedCategorySlug] = [];
    }
    booksByCategory[normalizedCategorySlug].push(book);
  });

  // Sort books within each category by display_order
  Object.keys(booksByCategory).forEach(categorySlug => {
    booksByCategory[categorySlug].sort((a, b) => a.display_order - b.display_order);
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
    const useCarousel = categoryBooks.length > 6;

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
                {categoryBooks.map((book) => (
                  <CarouselItem key={book.slug} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/4 lg:basis-1/6">
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
              <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 z-10" />
              <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
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
            <div className="max-w-7xl mx-auto space-y-12">
              {categories.map(category => {
                const normalizedSlug = normalizeSlug(category.slug);
                const categoryBooks = booksByCategory[normalizedSlug] || [];
                if (categoryBooks.length === 0) return null;
                
                return (
                  <section key={category.slug} className="mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-4">{category.title}</h2>
                    {category.description && (
                      <p className="text-gray-300 mb-6">{category.description}</p>
                    )}
                    {renderBookList(categoryBooks)}
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;
