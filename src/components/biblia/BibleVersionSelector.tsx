
import React from 'react';
import { BibleVersion } from '@/types/biblia';

interface BibleVersionSelectorProps {
  version: BibleVersion;
  onChange: (version: BibleVersion) => void;
  className?: string;
}

// Lista de versões disponíveis com nomes completos
const versionOptions: { value: BibleVersion; label: string }[] = [
  { value: 'acf', label: 'ACF - Almeida Corrigida Fiel' },
  { value: 'ara', label: 'ARA - Almeida Revista e Atualizada' },
  { value: 'arc', label: 'ARC - Almeida Revista e Corrigida' },
  { value: 'naa', label: 'NAA - Nova Almeida Atualizada' },
  { value: 'ntlh', label: 'NTLH - Nova Tradução na Linguagem de Hoje' },
  { value: 'nvi', label: 'NVI - Nova Versão Internacional' },
  { value: 'nvt', label: 'NVT - Nova Versão Transformadora' }
];

const BibleVersionSelector: React.FC<BibleVersionSelectorProps> = ({ 
  version, 
  onChange,
  className = ""
}) => {
  return (
    <select
      value={version}
      onChange={(e) => onChange(e.target.value as BibleVersion)}
      className={`border border-gray-200 rounded-lg py-1 px-2 text-sm ${className}`}
    >
      {versionOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.value.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

// Componente expandido que mostra o nome completo da versão
export const BibleVersionSelectorFull: React.FC<BibleVersionSelectorProps> = ({ 
  version, 
  onChange,
  className = ""
}) => {
  return (
    <select
      value={version}
      onChange={(e) => onChange(e.target.value as BibleVersion)}
      className={`border border-gray-200 rounded-lg py-2 px-3 ${className}`}
    >
      {versionOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default BibleVersionSelector;
