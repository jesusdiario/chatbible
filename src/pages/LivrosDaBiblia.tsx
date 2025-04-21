
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ChatHeader from "@/components/ChatHeader";
import Sidebar from "@/components/Sidebar";
import { Book } from "@/types/book";

// Component to display book cards
const BookCard = ({ book }: { book: Book }) => (
  <Link
    to={`/livros-da-biblia/${book.slug}`}
    className="block rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition bg-chatgpt-sidebar border border-chatgpt-border"
  >
    <img
      src={book.image_url || `/images/covers/${book.slug}.jpg`}
      alt={`Capa de ${book.title}`}
      className="w-full h-36 sm:h-48 object-cover"
    />
    <div className="p-2 bg-chatgpt-secondary">
      <span className="text-sm font-medium text-white">{book.title}</span>
    </div>
  </Link>
);

const LivrosDaBiblia = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['bible-books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bible_books')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data as Book[];
    }
  });

  // Group books by category
  const booksByCategory = books.reduce((acc: { [key: string]: Book[] }, book) => {
    if (!acc[book.book_category]) {
      acc[book.book_category] = [];
    }
    acc[book.book_category].push(book);
    return acc;
  }, {});

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  const categoryTitles: { [key: string]: string } = {
    'pentateuco': 'Pentateuco',
    'historico': 'Históricos',
    'poetico': 'Poéticos',
    'profetico': 'Proféticos',
    'novo_testamento': 'Novo Testamento',
    'outro': 'Outros Livros'
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
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <span className="text-lg">Carregando livros...</span>
            </div>
          ) : (
            Object.entries(booksByCategory).map(([category, categoryBooks]) => (
              <section key={category} className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mt-6 mb-4">
                  {categoryTitles[category] || category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {categoryBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default LivrosDaBiblia;
