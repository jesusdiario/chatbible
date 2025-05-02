
import React, { useEffect } from 'react';
import { useBooksByTestament } from '@/hooks/useBiblia1Data';
import { createInitialData } from '@/services/biblia1Service';
import Biblia1TestamentSection from '@/components/biblia1/Biblia1TestamentSection';
import Biblia1BottomNav from '@/components/biblia1/Biblia1BottomNav';
import { Loader2, ArrowUp } from 'lucide-react';

const Biblia: React.FC = () => {
  const { booksByTestament, isLoading, error } = useBooksByTestament();
  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Initialize data if needed
  useEffect(() => {
    const initializeData = async () => {
      try {
        await createInitialData();
        setInitialized(true);
        // Reload the page after initialization
        if (booksByTestament.length === 0) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    
    if (!initialized && booksByTestament.length === 0 && !isLoading) {
      initializeData();
    }
  }, [initialized, booksByTestament, isLoading]);
  
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
        {booksByTestament.length > 0 ? (
          booksByTestament.map(({ testament, books }) => (
            <Biblia1TestamentSection 
              key={testament.id} 
              testament={testament} 
              books={books} 
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Carregando livros da Bíblia...</p>
            {initialized ? (
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Recarregar
              </button>
            ) : null}
          </div>
        )}
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
