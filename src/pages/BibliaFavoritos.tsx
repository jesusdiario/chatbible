
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Archive, 
  BookOpen, 
  Bookmark, 
  BookmarkX,
  Trash2
} from 'lucide-react';
import { useBibleFavorites } from '@/hooks/useBiblia';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import { BibleVersion, Verse } from '@/types/biblia';
import BibleVersionSelector from '@/components/biblia/BibleVersionSelector';

const BibliaFavoritos = () => {
  const navigate = useNavigate();
  const [version, setVersion] = React.useState<BibleVersion>('acf');
  const { favorites, removeFavorite, useFavoritesData } = useBibleFavorites();
  const { data: favoriteVerses, isLoading, error } = useFavoritesData();
  
  // Agrupar versículos por livro/capítulo
  const groupedVerses = useMemo(() => {
    if (!favoriteVerses || favoriteVerses.length === 0) return {};
    
    const groups: Record<string, Verse[]> = {};
    
    favoriteVerses.forEach(verse => {
      const key = `${verse.book_id}-${verse.chapter}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(verse);
    });
    
    return groups;
  }, [favoriteVerses]);
  
  // Ordenar as chaves dos grupos
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedVerses).sort((a, b) => {
      const [bookIdA, chapterA] = a.split('-');
      const [bookIdB, chapterB] = b.split('-');
      
      if (bookIdA === bookIdB) {
        return parseInt(chapterA) - parseInt(chapterB);
      }
      
      return parseInt(bookIdA) - parseInt(bookIdB);
    });
  }, [groupedVerses]);
  
  const handleViewInContext = (verse: Verse) => {
    navigate(`/biblia/${verse.book_id}/${verse.chapter}?highlight=${verse.verse}`);
  };
  
  const handleRemoveFavorite = (verse: Verse) => {
    removeFavorite(verse);
  };
  
  const handleRemoveAllInChapter = (verses: Verse[]) => {
    if (verses && verses.length) {
      verses.forEach(verse => removeFavorite(verse));
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="mt-4 text-gray-600">Carregando seus favoritos...</span>
        <BibliaBottomNav />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 px-4">
        <p>Erro ao carregar seus favoritos</p>
        <p className="text-sm mt-2">{(error as Error).message}</p>
        <BibliaBottomNav />
      </div>
    );
  }
  
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <header className="py-4 px-4 flex justify-between items-center border-b sticky top-0 bg-white z-10">
        <h1 className="text-xl font-bold flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          Meus Favoritos
        </h1>
        
        <BibleVersionSelector 
          version={version} 
          onChange={setVersion}
        />
      </header>
      
      <main className="px-4 py-4">
        {favorites.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BookmarkX className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">Nenhum versículo favorito</h3>
            <p className="mt-2 text-gray-500">
              Use o ícone de favoritos ao ler a Bíblia para salvar versículos aqui.
            </p>
            <button 
              onClick={() => navigate('/biblia')} 
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Ir para Bíblia
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedGroupKeys.map(groupKey => {
              const verses = groupedVerses[groupKey];
              if (!verses || verses.length === 0) return null;
              
              const firstVerse = verses[0];
              const bookName = firstVerse.book_name || '';
              const chapter = firstVerse.chapter;
              
              return (
                <div key={groupKey} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
                    <h3 className="font-medium">
                      {bookName} {chapter}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => navigate(`/biblia/${firstVerse.book_id}/${chapter}`)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                        title="Ver capítulo completo"
                      >
                        <BookOpen className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleRemoveAllInChapter(verses)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="Remover todos os favoritos deste capítulo"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    {verses.map(verse => {
                      const textField = `text_${version}` as keyof Verse;
                      const text = verse[textField] as string;
                      
                      return (
                        <div key={verse.id} className="flex p-4">
                          <div className="pr-2 text-gray-400 font-bold flex-shrink-0 w-8 text-right">
                            {verse.verse}
                          </div>
                          <div className="flex-grow">
                            <p className="text-gray-800">{text || 'Versículo não disponível nesta versão'}</p>
                            
                            <div className="flex gap-4 mt-2">
                              <button 
                                onClick={() => handleViewInContext(verse)}
                                className="text-sm text-blue-600 flex items-center"
                              >
                                <Archive className="h-4 w-4 mr-1" />
                                Ver em contexto
                              </button>
                              
                              <button 
                                onClick={() => handleRemoveFavorite(verse)}
                                className="text-sm text-red-600 flex items-center"
                              >
                                <BookmarkX className="h-4 w-4 mr-1" />
                                Remover
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      
      <BibliaBottomNav />
    </div>
  );
};

export default BibliaFavoritos;
