
import React from 'react';
import { useBooksByTestament } from '@/hooks/useBiblia';
import BibliaTestamentSection from '@/components/biblia/BibliaTestamentSection';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import { Loader2 } from 'lucide-react';

const Biblia: React.FC = () => {
  const { booksByTestament, isLoading, error } = useBooksByTestament();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="mt-4">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <p>Erro ao carregar os livros da Bíblia</p>
        <p className="text-sm mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-4xl mx-auto px-4">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold">Bíblia Sagrada</h1>
        <p className="text-gray-600 mt-1">Selecione um livro para começar a leitura</p>
      </header>
      
      <main>
        {booksByTestament.map(({ testament, books }) => (
          <BibliaTestamentSection 
            key={testament.id} 
            testament={testament} 
            books={books} 
          />
        ))}
      </main>
      
      <BibliaBottomNav />
    </div>
  );
};

export default Biblia;
