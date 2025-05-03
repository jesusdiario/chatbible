
import React from 'react';
import { BookmarkIcon } from 'lucide-react';
import { Verse, BibleVersion } from '@/types/biblia';

interface VerseItemProps {
  verse: Verse;
  version: BibleVersion;
  onSelect?: (verse: Verse) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (verse: Verse) => void;
  highlight?: boolean;
}

const VerseItem: React.FC<VerseItemProps> = ({ 
  verse, 
  version,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
  highlight = false
}) => {
  const textField = `text_${version}` as keyof Verse;
  const text = verse[textField] as string || verse.text_naa || 'Versículo não disponível nesta versão';
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(verse);
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar o clique no verso
    if (onToggleFavorite) {
      onToggleFavorite(verse);
    }
  };
  
  return (
    <div 
      id={`verse-${verse.verse}`}
      onClick={handleClick}
      className={`py-1 flex ${onSelect ? 'cursor-pointer hover:bg-gray-50' : ''} ${highlight ? 'bg-yellow-50' : ''}`}
    >
      <div className="pr-2 text-gray-400 font-bold flex-shrink-0 w-8 text-right">
        {verse.verse}
      </div>
      <div className="flex-grow">
        <p className="text-lg text-gray-800">{text}</p>
      </div>
      
      {(onToggleFavorite) && (
        <button 
          onClick={handleFavorite}
          className="ml-2 p-1 text-gray-400 hover:text-yellow-500"
          aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <BookmarkIcon className={`h-5 w-5 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default VerseItem;
