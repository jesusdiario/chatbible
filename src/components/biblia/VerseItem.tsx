
import React from 'react';
import { Verse, BibleVersion } from '@/services/bibliaService';

interface VerseItemProps {
  verse: Verse;
  version: BibleVersion;
  onSelect: (verse: Verse) => void;
}

const VerseItem: React.FC<VerseItemProps> = ({ verse, version, onSelect }) => {
  // Mapeamento de versão para chave no objeto verse
  const textKey = `text_${version}` as keyof Verse;
  const verseText = verse[textKey] as string;
  
  const handleClick = () => {
    onSelect(verse);
  };
  
  return (
    <div className="py-1 group" onClick={handleClick}>
      <div className="flex items-start cursor-pointer">
        <span className="text-xs font-medium text-blue-500 mr-2 mt-0.5 select-none">
          {verse.verse}
        </span>
        <p className="text-gray-800 leading-relaxed group-hover:bg-gray-50 flex-1">
          {verseText || 'Texto não disponível nesta versão'}
        </p>
      </div>
    </div>
  );
};

export default VerseItem;
