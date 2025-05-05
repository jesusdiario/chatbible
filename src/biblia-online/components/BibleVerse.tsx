
import React from 'react';
import { Verse, BibleTranslation } from '../services/bibleService';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BibleVerseProps {
  verse: Verse;
  translation: BibleTranslation;
  showActions?: boolean;
  isSelected?: boolean;
  onSelect?: (verse: Verse) => void;
}

export const BibleVerse: React.FC<BibleVerseProps> = ({
  verse,
  translation,
  showActions = false,
  isSelected = false,
  onSelect
}) => {
  const navigate = useNavigate();

  // Determine which verse text to show based on selected translation
  const getVerseText = () => {
    // Primeiro, verificar a tradução selecionada
    if (translation === BibleTranslation.Default) {
      // Se for a tradução padrão (NAA), procurar nessa ordem:
      return verse.text_naa || verse.text_nvi || verse.text_acf || verse.text_ara || verse.text_arc || verse.text_ntlh || verse.text_nvt || '';
    }
    
    // Se uma tradução específica foi selecionada, tentar usá-la primeiro
    return verse[translation] || verse.text_naa || verse.text_nvi || verse.text_acf || verse.text_ara || verse.text_arc || verse.text_ntlh || verse.text_nvt || '';
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(verse);
    }
  };

  return (
    <div 
      className={cn(
        "group flex mb-4 cursor-pointer", 
        isSelected && "bg-gray-50 rounded"
      )}
      onClick={handleClick}
    >
      <div className="mr-2 font-bold text-gray-400 pt-0.5 w-6 text-right">
        {verse.verse}
      </div>
      <div className="flex-1">
        <p className={cn(
          "leading-relaxed",
          isSelected && "border-b border-dotted border-blue-500"
        )}>
          <span className={cn(
            isSelected && "border-b border-dotted border-blue-500"
          )}>
            {getVerseText()}
          </span>
        </p>
        {showActions && !isSelected && (
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <Button variant="outline" size="sm" onClick={(e) => {
              e.stopPropagation(); 
              if (onSelect) {
                onSelect(verse);
              }
            }}>
              <MessageSquare className="mr-1 h-4 w-4" />
              Selecionar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
