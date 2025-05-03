
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { BibleVersion } from '@/services/bibliaService';

interface BibleSearchFormProps {
  onSearch: (term: string) => void;
  version: BibleVersion;
  onVersionChange: (version: BibleVersion) => void;
}

const BibleSearchForm: React.FC<BibleSearchFormProps> = ({ onSearch, version, onVersionChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length >= 3) {
      onSearch(searchTerm.trim());
    }
  };
  
  const versionOptions: { value: BibleVersion; label: string }[] = [
    { value: 'acf', label: 'ACF - Almeida Corrigida Fiel' },
    { value: 'ara', label: 'ARA - Almeida Revista e Atualizada' },
    { value: 'arc', label: 'ARC - Almeida Revista e Corrigida' },
    { value: 'naa', label: 'NAA - Nova Almeida Atualizada' },
    { value: 'ntlh', label: 'NTLH - Nova Tradução na Linguagem de Hoje' },
    { value: 'nvi', label: 'NVI - Nova Versão Internacional' },
    { value: 'nvt', label: 'NVT - Nova Versão Transformadora' }
  ];
  
  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar na Bíblia..."
          className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          minLength={3}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      
      <div>
        <label htmlFor="version-select" className="block text-sm font-medium text-gray-700 mb-1">
          Versão da Bíblia
        </label>
        <select
          id="version-select"
          value={version}
          onChange={(e) => onVersionChange(e.target.value as BibleVersion)}
          className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {versionOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <button
        type="submit"
        disabled={searchTerm.trim().length < 3}
        className={`w-full py-2 px-4 rounded-lg font-medium ${
          searchTerm.trim().length < 3
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        Buscar
      </button>
    </form>
  );
};

export default BibleSearchForm;
