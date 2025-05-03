
import React, { useState } from 'react';
import { Verse, BibleVersion } from '@/services/bibliaService';
import { Copy, Share, Bookmark, Heart, X } from 'lucide-react';
import { useBibleFavorites } from '@/hooks/useBiblia';

interface VerseSelectionModalProps {
  verses: Verse[];
  version: BibleVersion;
  onClose: () => void;
}

const VerseSelectionModal: React.FC<VerseSelectionModalProps> = ({ verses, version, onClose }) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const { addFavorite, isFavorite } = useBibleFavorites();
  
  if (verses.length === 0) return null;
  
  // Função para formatar o texto selecionado
  const formatSelectedText = () => {
    return verses.map(verse => {
      const textKey = `text_${version}` as keyof Verse;
      const verseText = verse[textKey] as string;
      
      // Se temos apenas um versículo, podemos também incluir o nome do livro
      if (verses.length === 1 && verse.book_id) {
        const [testament, abbrev] = String(verse.book_id).split('.');
        return `${abbrev} ${verse.chapter}:${verse.verse} - ${verseText}`;
      }
      
      return `${verse.verse}. ${verseText}`;
    }).join('\n\n');
  };
  
  // Manipular cópia de texto
  const handleCopy = () => {
    const textToCopy = formatSelectedText();
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      },
      (err) => {
        console.error('Erro ao copiar: ', err);
      }
    );
  };
  
  // Manipular compartilhamento
  const handleShare = () => {
    const textToShare = formatSelectedText();
    
    if (navigator.share) {
      navigator.share({
        title: 'Versículo da Bíblia',
        text: textToShare,
      }).catch(err => {
        console.error('Erro ao compartilhar: ', err);
      });
    } else {
      // Fallback para navegadores que não suportam a API de compartilhamento
      handleCopy();
    }
  };
  
  // Adicionar aos favoritos
  const handleAddToFavorites = () => {
    verses.forEach(verse => {
      addFavorite(verse);
    });
    onClose();
  };
  
  // Verificar se todos os versículos já são favoritos
  const allFavorites = verses.every(verse => isFavorite(verse));
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">
            {verses.length} {verses.length === 1 ? 'versículo selecionado' : 'versículos selecionados'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="max-h-60 overflow-y-auto mb-4 p-2 bg-gray-50 rounded">
          {verses.map(verse => {
            const textKey = `text_${version}` as keyof Verse;
            const verseText = verse[textKey] as string;
            
            return (
              <div key={verse.id} className="mb-2">
                <div className="flex">
                  <span className="text-xs font-medium text-blue-500 mr-2 whitespace-nowrap">
                    {verse.verse}
                  </span>
                  <p className="text-gray-800 text-sm">{verseText}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-2 justify-between">
          <button 
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <Copy className="h-4 w-4" />
            <span className="text-sm">{showCopySuccess ? 'Copiado!' : 'Copiar'}</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <Share className="h-4 w-4" />
            <span className="text-sm">Compartilhar</span>
          </button>
          
          <button 
            onClick={handleAddToFavorites}
            disabled={allFavorites}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg ${
              allFavorites 
                ? 'bg-pink-50 text-pink-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {allFavorites ? (
              <Heart className="h-4 w-4 fill-pink-600 text-pink-600" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            <span className="text-sm">
              {allFavorites ? 'Favorito' : 'Favoritar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerseSelectionModal;
