
import React, { useState } from 'react';
import { useBibleBooks } from '@/hooks/useBibleBooks';
import BookCard from '@/components/bible/BookCard';
import BottomNav from '@/components/bible/BottomNav';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BooksList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: books, isLoading, error } = useBibleBooks(searchTerm);
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="pb-20 min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white p-4 flex items-center gap-4">
        <button onClick={handleBack} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-medium">Referências</h1>
      </header>
      
      <div className="px-4 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <Input
            type="search"
            placeholder="Pesquisar"
            className="pl-10 py-3 rounded-full bg-gray-100 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Carregando...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">
          <p>Erro ao carregar livros</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {books?.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default BooksList;
