
import React, { useState } from 'react';
import { Search, BookOpen, History, X } from 'lucide-react';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import BibleSearchForm from '@/components/biblia/BibleSearchForm';
import BibleSearchResults from '@/components/biblia/BibleSearchResults';
import { BibleVersion, Verse } from '@/types/biblia';
import { useBibleSearch } from '@/hooks/useBiblia';

const BibliaPesquisar = () => {
  const {
    searchTerm,
    setSearchTerm,
    version,
    setVersion,
    searchResults,
    isLoading,
    error
  } = useBibleSearch();
  
  // Estado para histórico de pesquisa recente (salvo localmente)
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('bible-search-history');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Realizar uma pesquisa
  const handleSearch = (term: string, ver: BibleVersion) => {
    setSearchTerm(term);
    setVersion(ver);
    
    // Adicionar ao histórico se não existir ainda
    if (term.trim() && !searchHistory.includes(term.trim())) {
      const updatedHistory = [term.trim(), ...searchHistory].slice(0, 10);
      setSearchHistory(updatedHistory);
      localStorage.setItem('bible-search-history', JSON.stringify(updatedHistory));
    }
  };
  
  // Limpar histórico de pesquisa
  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('bible-search-history');
  };
  
  // Remover um item do histórico
  const removeFromHistory = (term: string) => {
    const updatedHistory = searchHistory.filter(item => item !== term);
    setSearchHistory(updatedHistory);
    localStorage.setItem('bible-search-history', JSON.stringify(updatedHistory));
  };
  
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <header className="py-4 px-4 border-b sticky top-0 bg-white z-10">
        <h1 className="text-xl font-bold flex items-center mb-4">
          <Search className="h-5 w-5 mr-2" />
          Pesquisa Bíblica
        </h1>
        
        <BibleSearchForm 
          onSearch={handleSearch}
          isLoading={isLoading}
          initialVersion={version}
        />
      </header>
      
      <main className="px-4 py-4">
        {searchTerm ? (
          <BibleSearchResults
            results={searchResults || []}
            searchTerm={searchTerm}
            version={version}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
          />
        ) : (
          <div className="space-y-6">
            {/* Sugestões de pesquisa */}
            <section>
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Sugestões de pesquisa
              </h2>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  'amor', 'fé', 'esperança', 'salvação', 
                  'perdão', 'graça', 'Jesus', 'Espírito Santo'
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term, version)}
                    className="border rounded-lg p-3 text-center hover:bg-gray-50 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
            
            {/* Histórico de pesquisa */}
            {searchHistory.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-medium flex items-center">
                    <History className="h-5 w-5 mr-2" />
                    Pesquisas recentes
                  </h2>
                  
                  <button 
                    onClick={clearHistory}
                    className="text-sm text-gray-500 hover:text-red-600"
                  >
                    Limpar histórico
                  </button>
                </div>
                
                <ul className="border rounded-lg divide-y overflow-hidden">
                  {searchHistory.map((term) => (
                    <li key={term} className="flex items-center justify-between p-3">
                      <button 
                        onClick={() => handleSearch(term, version)}
                        className="flex-grow text-left hover:text-blue-600"
                      >
                        {term}
                      </button>
                      
                      <button 
                        onClick={() => removeFromHistory(term)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
            {/* Dicas de pesquisa */}
            <section className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <h2 className="font-medium mb-2 text-blue-800">Dicas de pesquisa</h2>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Digite pelo menos 3 caracteres para iniciar a pesquisa</li>
                <li>• Busque versículos por palavras-chave ou frases</li>
                <li>• Selecione diferentes versões da Bíblia para sua busca</li>
                <li>• Os resultados são exibidos em ordem de relevância</li>
              </ul>
            </section>
          </div>
        )}
      </main>
      
      <BibliaBottomNav />
    </div>
  );
};

export default BibliaPesquisar;
