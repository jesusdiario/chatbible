
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getBibleCategories, getBibleBooks, BibleCategory, BibleBook } from "@/services/bibleService";

const LivrosDaBiblia = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  // Fetch categories
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['bible_categories'],
    queryFn: getBibleCategories
  });

  // Fetch books
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ['bible_books'],
    queryFn: getBibleBooks
  });

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  // Group books by category
  const booksByCategory: Record<string, BibleBook[]> = {};
  books.forEach(book => {
    if (!book.category_slug) return;
    if (!booksByCategory[book.category_slug]) {
      booksByCategory[book.category_slug] = [];
    }
    booksByCategory[book.category_slug].push(book);
  });

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
                    {categoryBooks.map(book => (
                      <Link
                        key={book.slug}
                        to={`/livros-da-biblia/${book.slug}`}
                        className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition group"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={book.image_url || `/images/covers/${book.slug}.jpg`}
                            alt={`Capa de ${book.title}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/covers/default.jpg";
                            }}
                          />
                        </div>
                        <div className="p-2 bg-chatgpt-secondary">
                          <span className="text-sm font-medium">{book.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
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
