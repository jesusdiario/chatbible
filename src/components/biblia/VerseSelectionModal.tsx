
import React from 'react';
import { Verse } from '@/services/bibliaService';
import { X, Copy, Share, Bookmark } from 'lucide-react';
import { useBibleFavorites } from '@/hooks/useBiblia';

interface VerseSelectionModalProps {
  verses: Verse[];
  version: string;
  onClose: () => void;
}

const VerseSelectionModal: React.FC<VerseSelectionModalProps> = ({ verses, version, onClose }) => {
  const { addFavorite } = useBibleFavorites();
  
  if (verses.length === 0) return null;

  // Preparar texto dos versículos selecionados
  const textKey = `text_${version}` as keyof Verse;
  
  const formattedVerses = verses.map(verse => {
    const text = verse[textKey] as string || 'Texto não disponível';
    return `${verse.verse} ${text}`;
  }).join('\n');
  
  const reference = verses.length > 0
    ? `${getBookNameFromId(String(verses[0].book_id))} ${verses[0].chapter}:${verses[0].verse}${verses.length > 1 ? `-${verses[verses.length-1].verse}` : ''}`
    : '';
  
  const fullText = `${reference}\n\n${formattedVerses} (${version.toUpperCase()})`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Texto copiado para a área de transferência!');
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reference,
        text: fullText
      }).catch(err => {
        console.error('Erro ao compartilhar:', err);
      });
    } else {
      handleCopy();
    }
  };
  
  const handleAddAllToFavorites = () => {
    verses.forEach(verse => {
      addFavorite(verse);
    });
    alert('Versículos adicionados aos favoritos!');
  };
  
  // Função para extrair nome do livro do book_id
  function getBookNameFromId(bookId: string): string {
    const parts = bookId.split('.');
    if (parts.length < 2) return bookId;
    
    const abbrev = parts[1];
    // Simplificação - em uma implementação completa teríamos um mapeamento de abreviações para nomes completos
    return abbrev;
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{reference}</h3>
          <button onClick={onClose} className="text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-grow">
          <p className="text-gray-800 whitespace-pre-line">{formattedVerses}</p>
        </div>
        
        <div className="border-t p-4 flex justify-around">
          <button 
            onClick={handleCopy} 
            className="flex flex-col items-center text-gray-700"
          >
            <Copy className="h-5 w-5 mb-1" />
            <span className="text-sm">Copiar</span>
          </button>
          
          <button 
            onClick={handleShare} 
            className="flex flex-col items-center text-gray-700"
          >
            <Share className="h-5 w-5 mb-1" />
            <span className="text-sm">Compartilhar</span>
          </button>
          
          <button 
            onClick={handleAddAllToFavorites} 
            className="flex flex-col items-center text-gray-700"
          >
            <Bookmark className="h-5 w-5 mb-1" />
            <span className="text-sm">Favoritar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerseSelectionModal;
