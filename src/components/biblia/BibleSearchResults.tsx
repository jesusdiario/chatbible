
import React from 'react';
import { Link } from 'react-router-dom';
import { Verse, BibleVersion } from '@/types/biblia';
import { BookOpen } from 'lucide-react';

interface BibleSearchResultsProps {
  results: Verse[];
  searchTerm: string;
  version: BibleVersion;
  isLoading: boolean;
  error?: Error | null;
}

const BibleSearchResults: React.FC<BibleSearchResultsProps> = ({
  results,
  searchTerm,
  version,
  isLoading,
  error
}) => {
  const textField = `text_${version}` as keyof Verse;
  
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Buscando "{searchTerm}"...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8 text-center text-red-600">
        <p>Ocorreu um erro ao realizar a busca:</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  if (results.length === 0 && searchTerm) {
    return (
      <div className="py-12 text-center text-gray-600">
        <p>Nenhum resultado encontrado para "{searchTerm}".</p>
      </div>
    );
  }
  
  const highlightText = (text: string | null, term: string): React.ReactNode => {
    if (!text) return <span>Texto não disponível nesta versão</span>;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === term.toLowerCase() 
        ? <mark key={i} className="bg-yellow-200">{part}</mark> 
        : part
    );
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">
        {results.length} {results.length === 1 ? 'resultado' : 'resultados'} encontrado{results.length !== 1 ? 's' : ''}:
      </h3>
      
      {results.map((verse) => {
        const text = verse[textField] as string;
        return (
          <div key={verse.id} className="border-b pb-3">
            <div className="flex items-center text-blue-600 mb-1">
              <BookOpen className="h-4 w-4 mr-1" />
              <Link to={`/biblia/${verse.book_id}/${verse.chapter}?highlight=${verse.verse}`} className="hover:underline">
                {verse.book_name} {verse.chapter}:{verse.verse}
              </Link>
            </div>
            <p className="text-gray-800">
              {highlightText(text, searchTerm)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default BibleSearchResults;
