
import React from 'react';
import { Verse, BibleTranslation } from '../services/bibleService';
import { Button } from '@/components/ui/button';
import { X, Copy, Share2 } from 'lucide-react';
import { BibleButton } from '../hooks/useVerseSelection';
import { toast } from '@/hooks/use-toast';

interface VerseSelectionDrawerProps {
  open: boolean;
  onClose: () => void;
  verseReference: string;
  selectedVerses: Verse[];
  currentTranslation: BibleTranslation;
  buttons: BibleButton[];
  isLoadingButtons: boolean;
  getSelectedVersesText: (translation: string) => string;
}

export const VerseSelectionDrawer: React.FC<VerseSelectionDrawerProps> = ({
  open,
  onClose,
  verseReference,
  selectedVerses,
  currentTranslation,
  buttons,
  isLoadingButtons,
  getSelectedVersesText
}) => {
  // Recupera o texto completo dos versículos para cópia/compartilhamento
  const versesText = getSelectedVersesText(currentTranslation);

  // Manipula a cópia do texto para a área de transferência
  const handleCopyText = () => {
    if (!navigator.clipboard) {
      toast({
        title: "Atenção",
        description: "Seu navegador não suporta a funcionalidade de copiar para área de transferência",
        variant: "destructive"
      });
      return;
    }
    
    navigator.clipboard.writeText(versesText)
      .then(() => {
        toast({
          title: "Sucesso",
          description: "Texto copiado para a área de transferência!",
          variant: "default"
        });
      })
      .catch(err => {
        console.error('Erro ao copiar texto: ', err);
        toast({
          title: "Erro",
          description: "Não foi possível copiar o texto",
          variant: "destructive"
        });
      });
  };

  // Se não estiver aberto, não renderize nada
  if (!open) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 rounded-t-xl shadow-lg transform transition-transform duration-300 z-50">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Versículos Selecionados</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>
        
        {verseReference && (
          <div className="mb-4">
            <p className="text-blue-600 font-bold">{verseReference}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={handleCopyText}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar Texto
          </Button>
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={() => {
              const text = encodeURIComponent(versesText);
              const url = `https://twitter.com/intent/tweet?text=${text}`;
              window.open(url, '_blank');
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>

        {isLoadingButtons ? (
          <div className="flex justify-center my-4">
            <p>Carregando opções...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 max-h-40 overflow-y-auto">
            {buttons.map(button => (
              <Button
                key={button.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  console.log('Clicou no botão:', button.button_name);
                  // Aqui implementaríamos a navegação ou ação específica do botão
                  // router.push(`/chat/${button.slug}?reference=${verseReference}&text=${encodeURIComponent(versesText)}`);
                }}
              >
                {button.button_name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
