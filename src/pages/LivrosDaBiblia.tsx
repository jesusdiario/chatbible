
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import { getBibleCategories, getBibleBooks, BibleCategory, BibleBook } from "@/services/bibleService";
import LoadingSpinner from "@/components/LoadingSpinner";

const LivrosDaBiblia = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [categories, setCategories] = useState<BibleCategory[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, booksData] = await Promise.all([
          getBibleCategories(),
          getBibleBooks()
        ]);
        
        setCategories(categoriesData);
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching bible data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  // Group books by category
  const booksByCategory: Record<string, BibleBook[]> = {};
  books.forEach(book => {
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
          {loading ? (
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {categoryBooks.map(book => (
                      <Link
                        key={book.slug}
                        to={`/livros-da-biblia/${book.slug}`}
                        className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition bg-chatgpt-sidebar border border-chatgpt-border"
                      >
                        <img
                          src={book.image_url || `/images/covers/${book.slug}.jpg`}
                          alt={`Capa de ${book.title}`}
                          className="w-full h-36 sm:h-48 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/covers/default.jpg";
                          }}
                        />
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
