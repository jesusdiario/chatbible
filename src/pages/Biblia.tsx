
import React from 'react';
import { useBooksByTestament } from '@/hooks/useBiblia1Data';
import Biblia1TestamentSection from '@/components/biblia1/Biblia1TestamentSection';
import Biblia1BottomNav from '@/components/biblia1/Biblia1BottomNav';
import { Loader2, ArrowUp } from 'lucide-react';

const Biblia: React.FC = () => {
  const { booksByTestament, isLoading, error } = useBooksByTestament();
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
    <div className="pb-20 pt-6 max-w-4xl mx-auto px-4">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold">Bíblia Sagrada</h1>
      </header>
      
      <main>
        {booksByTestament.map(({ testament, books }) => (
          <Biblia1TestamentSection 
            key={testament.id} 
            testament={testament} 
            books={books} 
          />
        ))}
      </main>
      
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 bg-blue-500 text-white rounded-full p-2 shadow-md z-10"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
      
      <Biblia1BottomNav />
    </div>
  );
};

export default Biblia;
