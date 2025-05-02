
import React from 'react';
import { useBooksByTestament } from '@/hooks/useBiblia1Data';
import Biblia1TestamentSection from '@/components/biblia1/Biblia1TestamentSection';
import Biblia1BottomNav from '@/components/biblia1/Biblia1BottomNav';
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
      </header>
      
      <main>
        {booksByTestament && booksByTestament.length > 0 ? (
          booksByTestament.map(({ testament, books }) => (
            <Biblia1TestamentSection 
              key={testament.id} 
              testament={testament} 
              books={books} 
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">Nenhum livro encontrado</p>
        )}
      </main>
      
      <Biblia1BottomNav />
    </div>
  );
};

export default Biblia;
