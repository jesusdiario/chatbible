
import React, { useState } from 'react';
import { X, Copy, Share2, BookmarkPlus } from 'lucide-react';
import { Verse, BibleVersion } from '@/types/biblia';
import { toast } from 'sonner';

interface VerseSelectionModalProps {
  verses: Verse[];
  version: BibleVersion;
  onClose: () => void;
  onAddToFavorites?: (verses: Verse[]) => void;
}

const VerseSelectionModal: React.FC<VerseSelectionModalProps> = ({
  verses,
  version,
  onClose,
  onAddToFavorites
}) => {
  const [copied, setCopied] = useState(false);
  
  if (verses.length === 0) return null;
  
  // Ordenar os versículos por ordem numérica
  const sortedVerses = [...verses].sort((a, b) => {
    if (a.chapter !== b.chapter) return (a.chapter || 0) - (b.chapter || 0);
    return (a.verse || 0) - (b.verse || 0);
  });
  
  // Obter informações do primeiro versículo para referência
  const firstVerse = sortedVerses[0];
  const book_name = firstVerse.book_name || '';
  const chapter = firstVerse.chapter;
  
  // Criar texto completo para cópia
  const getVerseText = (verse: Verse) => {
    const textField = `text_${version}` as keyof Verse;
    return verse[textField] as string || 'Versículo não disponível';
  };
  
  const verseTexts = sortedVerses.map(verse => 
    `${verse.verse} ${getVerseText(verse)}`
  );
  
  // Calcular a referência completa
  let reference = `${book_name} ${chapter}`;
  if (verses.length === 1) {
    reference += `:${sortedVerses[0].verse}`;
  } else {
    const firstVerseNum = sortedVerses[0].verse;
    const lastVerseNum = sortedVerses[sortedVerses.length - 1].verse;
    reference += `:${firstVerseNum}-${lastVerseNum}`;
  }
  
  const fullText = `${reference}\n\n${verseTexts.join('\n')}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(fullText).then(
      () => {
        setCopied(true);
        toast.success('Texto copiado para a área de transferência');
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        toast.error('Falha ao copiar texto');
      }
    );
  };
  
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: reference,
          text: fullText,
        });
      } else {
        handleCopy();
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };
  
  const handleSaveToFavorites = () => {
    if (onAddToFavorites) {
      onAddToFavorites(verses);
      toast.success('Adicionado aos favoritos');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white rounded-t-lg sm:rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-lg">{reference}</h3>
          <button onClick={onClose} className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {sortedVerses.map((verse) => (
            <div key={verse.id} className="mb-3">
              <p>
                <span className="font-bold mr-2">{verse.verse}</span>
                {getVerseText(verse)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-around items-center p-4 bg-gray-50">
          <button
            onClick={handleCopy}
            className="flex flex-col items-center text-sm text-gray-700"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-1">
              <Copy className="h-5 w-5" />
            </div>
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          
          <button
            onClick={handleShare}
            className="flex flex-col items-center text-sm text-gray-700"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-1">
              <Share2 className="h-5 w-5" />
            </div>
            Compartilhar
          </button>
          
          {onAddToFavorites && (
            <button
              onClick={handleSaveToFavorites}
              className="flex flex-col items-center text-sm text-gray-700"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-1">
                <BookmarkPlus className="h-5 w-5" />
              </div>
              Favoritos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerseSelectionModal;
