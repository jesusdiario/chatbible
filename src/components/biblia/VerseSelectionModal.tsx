
import React, { useState } from 'react';
import { X, Copy, Share, Heart, Download } from 'lucide-react';
import { Verse, BibleVersion } from '@/services/bibliaService';
import { useBibleFavorites } from '@/hooks/useBiblia';
import { toast } from 'sonner';

interface VerseSelectionModalProps {
  verses: Verse[];
  version: BibleVersion;
  onClose: () => void;
}

const VerseSelectionModal: React.FC<VerseSelectionModalProps> = ({ verses, version, onClose }) => {
  const { addFavorite } = useBibleFavorites();
  const [copied, setCopied] = useState(false);
  
  if (verses.length === 0) return null;
  
  // Mapeamento de versão para chave no objeto verse
  const textKey = `text_${version}` as keyof Verse;
  
  // Construir texto para cópia e compartilhamento
  const buildText = () => {
    return verses.map(verse => {
      const verseText = verse[textKey] as string || 'Texto não disponível';
      const bookId = String(verse.book_id).split('.')[1].toUpperCase();
      return `${bookId} ${verse.chapter}:${verse.verse} - ${verseText}`;
    }).join('\n\n');
  };
  
  // Manipulador para copiar texto
  const handleCopy = () => {
    const text = buildText();
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast.success('Texto copiado para a área de transferência');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar: ', err);
        toast.error('Erro ao copiar texto');
      });
  };
  
  // Manipulador para compartilhar
  const handleShare = () => {
    const text = buildText();
    
    if (navigator.share) {
      navigator.share({
        title: 'Versículo da Bíblia',
        text: text
      })
      .catch(err => {
        console.error('Erro ao compartilhar: ', err);
        toast.error('Erro ao compartilhar');
      });
    } else {
      // Fallback para dispositivos sem API de compartilhamento
      handleCopy();
    }
  };
  
  // Manipulador para favoritar
  const handleFavorite = () => {
    verses.forEach(verse => {
      addFavorite(verse);
    });
    
    toast.success(
      verses.length === 1 
        ? 'Versículo adicionado aos favoritos' 
        : 'Versículos adicionados aos favoritos'
    );
    
    onClose();
  };
  
  // Manipulador para baixar como txt
  const handleDownload = () => {
    const text = buildText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'versiculos-biblicos.txt';
    document.body.appendChild(a);
    a.click();
    
    // Limpar
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-xl w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium">
            {verses.length === 1 ? '1 versículo selecionado' : `${verses.length} versículos selecionados`}
          </h3>
          <button onClick={onClose} className="p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 max-h-60 overflow-y-auto">
          {verses.map(verse => {
            const verseText = verse[textKey] as string;
            const bookId = String(verse.book_id).split('.')[1].toUpperCase();
            
            return (
              <div key={verse.id} className="mb-3">
                <p className="font-medium text-sm text-blue-600 mb-1">
                  {bookId} {verse.chapter}:{verse.verse}
                </p>
                <p className="text-gray-800">
                  {verseText || 'Texto não disponível nesta versão'}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-4 border-t">
          <button 
            onClick={handleCopy}
            className="flex flex-col items-center py-3 text-gray-700 hover:bg-gray-50"
          >
            <Copy className="h-5 w-5 mb-1" />
            <span className="text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          
          <button 
            onClick={handleShare}
            className="flex flex-col items-center py-3 text-gray-700 hover:bg-gray-50"
          >
            <Share className="h-5 w-5 mb-1" />
            <span className="text-xs">Compartilhar</span>
          </button>
          
          <button 
            onClick={handleFavorite}
            className="flex flex-col items-center py-3 text-gray-700 hover:bg-gray-50"
          >
            <Heart className="h-5 w-5 mb-1" />
            <span className="text-xs">Favoritar</span>
          </button>
          
          <button 
            onClick={handleDownload}
            className="flex flex-col items-center py-3 text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-5 w-5 mb-1" />
            <span className="text-xs">Baixar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerseSelectionModal;
