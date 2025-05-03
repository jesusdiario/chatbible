
import React from 'react';
import { Verse } from '@/services/bibliaService';
import { Link } from 'react-router-dom';

interface BibleSearchResultsProps {
  results: Verse[] | undefined;
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  version: string;
}

const BibleSearchResults: React.FC<BibleSearchResultsProps> = ({ 
  results, isLoading, error, searchTerm, version 
}) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Buscando resultados...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Erro ao buscar: {error.message}</p>
      </div>
    );
  }
  
  if (!searchTerm || searchTerm.length < 3) {
    return (
      <div className="p-4 text-center text-gray-600">
        <p>Digite pelo menos 3 caracteres para buscar na Bíblia.</p>
      </div>
    );
  }
  
  if (!results || results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-600">
        <p>Nenhum resultado encontrado para "{searchTerm}".</p>
      </div>
    );
  }

  // Agrupar resultados por livro/capítulo para melhor visualização
  const groupedResults: Record<string, Verse[]> = {};
  
  results.forEach(verse => {
    const key = `${verse.book_id}-${verse.chapter}`;
    if (!groupedResults[key]) {
      groupedResults[key] = [];
    }
    groupedResults[key].push(verse);
  });
  
  const textKey = `text_${version}` as keyof Verse;
  
  return (
    <div className="p-4">
      <h2 className="font-bold text-lg mb-4">
        {results.length} resultado{results.length !== 1 ? 's' : ''} para "{searchTerm}"
      </h2>
      
      <div className="space-y-6">
        {Object.entries(groupedResults).map(([key, verses]) => {
          const book = getBookNameFromId(String(verses[0].book_id));
          const chapter = verses[0].chapter;
          
          return (
            <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-3 border-b border-gray-200">
                <Link to={`/biblia/${verses[0].book_id}/${chapter}`} className="font-medium text-blue-600">
                  {book} {chapter}
                </Link>
              </div>
              
              <div className="divide-y divide-gray-100">
                {verses.map(verse => (
                  <div key={verse.id} className="p-3">
                    <Link 
                      to={`/biblia/${verse.book_id}/${verse.chapter}?highlight=${verse.verse}`}
                      className="block hover:bg-gray-50 transition-colors rounded p-2"
                    >
                      <p>
                        <span className="font-semibold">{verse.verse}</span>{' '}
                        <span>{verse[textKey] as string || 'Texto não disponível'}</span>
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  // Função para extrair nome do livro do book_id
  function getBookNameFromId(bookId: string): string {
    const parts = bookId.split('.');
    if (parts.length < 2) return bookId;
    
    const abbrev = parts[1];
    // Simplificação - em uma implementação completa teríamos um mapeamento de abreviações para nomes completos
    return abbrev;
  }
};

export default BibleSearchResults;
