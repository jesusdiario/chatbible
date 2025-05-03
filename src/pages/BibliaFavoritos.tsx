
import React, { useEffect, useState } from 'react';
import { useBibleFavorites } from '@/hooks/useBiblia';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import { ChevronLeft, Trash2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Verse, BibleVersion } from '@/services/bibliaService';
import { supabase } from '@/integrations/supabase/client';

const BibliaFavoritos: React.FC = () => {
  const { favorites, removeFavorite } = useBibleFavorites();
  const [favoritesData, setFavoritesData] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState<BibleVersion>('acf');
  
  useEffect(() => {
    const loadFavorites = async () => {
      if (favorites.length === 0) {
        setFavoritesData([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Extrair informações dos favoritos
        const favoriteItems = favorites.map(fav => {
          const [bookId, chapter, verse] = fav.split(':');
          return { bookId, chapter, verse };
        });
        
        // Criar consultas para cada favorito
        const versesPromises = favoriteItems.map(item => {
          return supabase
            .from('verses')
            .select('*')
            .eq('book_id', item.bookId)
            .eq('chapter', item.chapter)
            .eq('verse', item.verse)
            .single();
        });
        
        // Executar todas as consultas
        const results = await Promise.all(versesPromises);
        
        // Filtrar e processar resultados
        const versesData = results
          .filter(result => !result.error && result.data)
          .map(result => result.data) as Verse[];
        
        setFavoritesData(versesData);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
  }, [favorites]);
  
  // Função para extrair nome do livro do book_id
  function getBookNameFromId(bookId: string): string {
    const parts = bookId.split('.');
    if (parts.length < 2) return bookId;
    
    const abbrev = parts[1];
    // Simplificação - em uma implementação completa teríamos um mapeamento
    return abbrev;
  }
  
  const handleRemoveFavorite = (verse: Verse) => {
    removeFavorite(verse);
  };
  
  const textKey = `text_${version}` as keyof Verse;
  
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <header className="py-4 px-4 flex items-center border-b sticky top-0 bg-white z-10">
        <Link to="/biblia" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Favoritos</h1>
        
        <div className="ml-auto">
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value as BibleVersion)}
            className="border border-gray-200 rounded-lg py-1 px-2 text-sm"
          >
            <option value="acf">ACF</option>
            <option value="ara">ARA</option>
            <option value="arc">ARC</option>
            <option value="naa">NAA</option>
            <option value="ntlh">NTLH</option>
            <option value="nvi">NVI</option>
            <option value="nvt">NVT</option>
          </select>
        </div>
      </header>
      
      <main className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : favoritesData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Você não tem versículos favoritos.</p>
            <Link 
              to="/biblia" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              <Search className="h-4 w-4 mr-2" />
              Explorar a Bíblia
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favoritesData.map(verse => (
              <div 
                key={verse.id} 
                className="border border-gray-200 rounded-lg p-3 transition-all hover:shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <Link 
                    to={`/biblia/${verse.book_id}/${verse.chapter}?highlight=${verse.verse}`} 
                    className="font-medium text-blue-600"
                  >
                    {getBookNameFromId(String(verse.book_id))} {verse.chapter}:{verse.verse}
                  </Link>
                  
                  <button 
                    onClick={() => handleRemoveFavorite(verse)} 
                    className="text-red-500 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-gray-800">
                  {verse[textKey] as string || "Texto não disponível nesta versão"}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <BibliaBottomNav />
    </div>
  );
};

export default BibliaFavoritos;
