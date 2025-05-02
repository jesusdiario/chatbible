
import React from 'react';
import { VerseWithReference } from '@/types/bible';
import { useSelectedVerse } from '@/contexts/SelectedVerseContext';

interface VerseProps {
  verse: VerseWithReference;
  onLongPress?: () => void;
}

const Verse: React.FC<VerseProps> = ({ verse, onLongPress }) => {
  const { setSelectedVerse } = useSelectedVerse();
  
  const handleClick = () => {
    setSelectedVerse(verse);
    if (onLongPress) onLongPress();
  };
  
  return (
    <div 
      className="mb-4 group" 
      onClick={handleClick}
    >
      <span className="text-xs align-super mr-1 text-gray-500 font-medium">{verse.verse}</span>
      <span className="text-lg leading-relaxed text-[#1e1e1e]">{verse.text}</span>
    </div>
  );
};

export default Verse;
