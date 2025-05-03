
import React, { useRef } from 'react';
import { Verse } from '@/services/bibliaService';
import { Bookmark, Share, ArrowRight } from 'lucide-react';
import { useBibleFavorites } from '@/hooks/useBiblia';

interface VerseItemProps {
  verse: Verse;
  version: string;
  onSelect: (verse: Verse) => void;
}

const VerseItem: React.FC<VerseItemProps> = ({ verse, version, onSelect }) => {
  const { isFavorite, addFavorite, removeFavorite } = useBibleFavorites();
  const verseRef = useRef<HTMLDivElement>(null);
  
  // Determinar qual texto exibir com base na versão
  const textKey = `text_${version}` as keyof Verse;
  const verseText = verse[textKey] as string || 'Texto não disponível nesta versão';
  
  const isFav = isFavorite(verse);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
      removeFavorite(verse);
    } else {
      addFavorite(verse);
    }
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Criar texto para compartilhamento
    const bookName = getBookNameFromId(String(verse.book_id));
    const reference = `${bookName} ${verse.chapter}:${verse.verse}`;
    const shareText = `${reference} - "${verseText}" (${version.toUpperCase()})`;
    
    if (navigator.share) {
      navigator.share({
        title: reference,
        text: shareText
      }).catch(err => {
        console.error('Erro ao compartilhar:', err);
      });
    } else {
      // Copiar para área de transferência como fallback
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Versículo copiado para a área de transferência!');
      });
    }
  };
  
  // Função para extrair nome do livro do book_id
  function getBookNameFromId(bookId: string): string {
    const parts = bookId.split('.');
    if (parts.length < 2) return bookId;
    
    const abbrev = parts[1];
    // Retornaria o nome completo do livro, mas como isso já está sendo tratado
    // em outro componente, vou apenas retornar a abreviação para simplificar
    return abbrev;
  }
  
  return (
    <div 
      ref={verseRef}
      className="group py-2 px-1 hover:bg-gray-50 rounded transition-colors cursor-pointer flex items-start"
      onClick={() => onSelect(verse)}
    >
      <span className="text-xs align-super font-bold text-gray-500 mr-2">{verse.verse}</span>
      <div className="flex-grow">
        <p className="text-gray-800">{verseText}</p>
        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button 
            onClick={toggleFavorite} 
            className={`p-1 rounded-full ${isFav ? 'text-yellow-500' : 'text-gray-400'}`}
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button onClick={handleShare} className="p-1 rounded-full text-gray-400">
            <Share className="h-4 w-4" />
          </button>
          <button className="p-1 rounded-full text-gray-400">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerseItem;
