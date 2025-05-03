
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { BibleVersion } from '@/types/biblia';
import BibleVersionSelector from './BibleVersionSelector';

interface BibleSearchFormProps {
  onSearch: (term: string, version: BibleVersion) => void;
  isLoading?: boolean;
  initialVersion?: BibleVersion;
}

const BibleSearchForm: React.FC<BibleSearchFormProps> = ({ 
  onSearch,
  isLoading = false,
  initialVersion = 'acf'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [version, setVersion] = useState<BibleVersion>(initialVersion);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 3) {
      onSearch(searchTerm.trim(), version);
    }
  };
  
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3 text-gray-400">
          <Search className="h-5 w-5" />
        </div>
        
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar na Bíblia (mínimo 3 caracteres)"
          className="w-full pl-10 pr-[90px] py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-[76px] text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        
        <div className="absolute right-2">
          <BibleVersionSelector
            version={version}
            onChange={setVersion}
            className="text-xs py-1 px-2"
          />
        </div>
      </div>
      
      <div className="mt-2">
        <button
          type="submit"
          disabled={searchTerm.trim().length < 3 || isLoading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
    </form>
  );
};

export default BibleSearchForm;
