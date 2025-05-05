
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

  const handleExegeseClick = () => {
    // Formatar a referência do versículo (livro, capítulo e versículo)
    const verseReference = `${verse.book_name || ''} ${verse.chapter || ''}:${verse.verse || ''}`;
    
    // Obter o texto do versículo atual
    const verseText = getVerseText();
    
    // Construir a mensagem para enviar ao chat
    const prompt = `Exegese do versículo "${verseReference}: ${verseText}"`;
    
    // Redirecionar para a página de chat com o livro apropriado
    navigate(`/livros-da-biblia/${verse.book_slug || 'genesis'}`, { 
      state: { 
        initialPrompt: prompt 
      }
    });
  };

  const handleVerseClick = () => {
    if (onSelect) {
      onSelect(verse);
    }
  };

  return (
    <div 
      className={cn(
        "group flex mb-4 cursor-pointer", 
        isSelected && "bg-blue-50 rounded-md"
      )}
      onClick={handleVerseClick}
    >
      <div className="mr-2 font-bold text-gray-400 pt-0.5 w-6 text-right">
        {verse.verse}
      </div>
      <div className="flex-1">
        <p className={cn(
          "leading-relaxed",
          isSelected && "border-b-2 border-dotted border-blue-400"
        )}>
          {getVerseText()}
        </p>
        {showActions && (
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExegeseClick}>
              <MessageSquare className="mr-1 h-4 w-4" />
              Exegese
            </Button>
            <Button variant="outline" size="sm">
              Salvar
            </Button>
            <Button variant="outline" size="sm">
              Copiar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
