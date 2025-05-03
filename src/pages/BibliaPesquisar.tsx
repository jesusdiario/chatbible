
import React from 'react';
import { useBibleSearch } from '@/hooks/useBiblia';
import BibliaBottomNav from '@/components/biblia/BibliaBottomNav';
import BibleSearchForm from '@/components/biblia/BibleSearchForm';
import BibleSearchResults from '@/components/biblia/BibleSearchResults';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const BibliaPesquisar: React.FC = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    version, 
    setVersion, 
    searchResults, 
    isLoading, 
    error 
  } = useBibleSearch();
  
  return (
    <div className="pb-20 max-w-4xl mx-auto">
      <header className="py-4 px-4 flex items-center border-b sticky top-0 bg-white z-10">
        <Link to="/biblia" className="mr-4">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-bold">Pesquisar na Bíblia</h1>
      </header>
      
      <div className="mt-4">
        <BibleSearchForm
          onSearch={setSearchTerm}
          version={version}
          onVersionChange={setVersion}
        />
        
        <BibleSearchResults
          results={searchResults}
          isLoading={isLoading}
          error={error}
          searchTerm={searchTerm}
          version={version}
        />
      </div>
      
      <BibliaBottomNav />
    </div>
  );
};

export default BibliaPesquisar;
