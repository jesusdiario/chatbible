import React, { useEffect, useState } from 'react';
import { useBooksByTestament, useFavorites } from '@/hooks/useBiblia1Data';
import { createInitialData, searchVerses, SearchResult } from '@/services/biblia1Service';
import Biblia1TestamentSection from '@/components/biblia1/Biblia1TestamentSection';
import Biblia1BottomNav from '@/components/biblia1/Biblia1BottomNav';
import Biblia1Favorites from '@/components/biblia1/Biblia1Favorites';
import { Loader2, ArrowUp, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from 'react-router-dom';

const Biblia: React.FC = () => {
  const { booksByTestament, isLoading, error } = useBooksByTestament();
  const { favorites, removeFavorite } = useFavorites();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  
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
        toast({
          title: "Dados inicializados",
          description: "Os dados da Bíblia foram carregados com sucesso",
        });
        
        // Reload the page after initialization if needed
        if (booksByTestament.length === 0) {
          window.location.reload();
        }
      } catch (error) {
        console.error('Erro inicializando dados:', error);
        toast({
          title: "Erro de inicialização",
          description: "Não foi possível inicializar os dados da Bíblia",
          variant: "destructive",
        });
      }
    };
    
    if (!initialized && booksByTestament.length === 0 && !isLoading) {
      initializeData();
    }
  }, [initialized, booksByTestament, isLoading, toast]);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSearch = async () => {
    if (searchQuery.length < 3) {
      toast({
        title: "Busca muito curta",
        description: "Digite pelo menos 3 caracteres para buscar",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchVerses(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast({
          title: "Sem resultados",
          description: "Nenhum versículo encontrado com esse termo",
        });
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível completar a busca",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
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
        <Button 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-6 max-w-4xl mx-auto px-4">
      <header className="py-6 text-center">
        <h1 className="text-2xl font-bold">Bíblia Sagrada</h1>
        
        <div className="flex items-center mt-4 justify-center">
          <Button
            variant="outline"
            size="icon"
            className="mr-2"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {showSearch && (
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Buscar versículos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                autoFocus
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buscar'}
              </Button>
              <Button variant="ghost" size="icon" onClick={clearSearch}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>
      
      <main>
        {searchResults.length > 0 ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Resultados da busca</h2>
              <Button variant="ghost" size="sm" onClick={clearSearch}>
                Limpar
              </Button>
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {searchResults.map(result => (
                  <div key={result.id} className="p-3 bg-blue-50 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <Link
                        to={`/biblia/${result.book_id}/${result.chapter}`}
                        className="text-blue-600 font-medium"
                      >
                        {result.book_name} {result.chapter}:{result.verse}
                      </Link>
                    </div>
                    <p>{result.text}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          booksByTestament.length > 0 ? (
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
                <Button 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Recarregar
                </Button>
              ) : null}
            </div>
          )
        )}
      </main>
      
      {showScrollTop && (
        <Button
          variant="outline" 
          size="icon"
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 rounded-full shadow-md z-10"
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
      
      <Biblia1Favorites 
        favorites={favorites} 
        removeFavorite={removeFavorite} 
      />
      <Biblia1BottomNav />
    </div>
  );
};

export default Biblia;
