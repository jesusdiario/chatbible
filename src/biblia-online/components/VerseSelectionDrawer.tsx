
import React from 'react';
import { Verse, BibleTranslation } from '../services/bibleService';
import { Drawer, DrawerContent, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { BibleButton } from '../hooks/useVerseSelection';

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
  // Formate o texto dos versículos selecionados para exibição
  const versesText = getSelectedVersesText(currentTranslation);

  // Manipula a cópia do texto para a área de transferência
  const handleCopyText = () => {
    if (!navigator.clipboard) {
      alert('Seu navegador não suporta a funcionalidade de copiar para área de transferência');
      return;
    }
    
    navigator.clipboard.writeText(versesText)
      .then(() => {
        // Poderíamos adicionar um toast aqui para feedback
        console.log('Texto copiado para a área de transferência!');
      })
      .catch(err => {
        console.error('Erro ao copiar texto: ', err);
      });
  };

  return (
    <Drawer open={open} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Versículos Selecionados</h3>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </Button>
            </DrawerClose>
          </div>
          
          {verseReference && (
            <div className="mb-4">
              <p className="text-blue-600 font-bold">{verseReference}</p>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700">
                {versesText}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleCopyText}
            >
              Copiar Texto
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                const text = encodeURIComponent(versesText);
                const url = `https://twitter.com/intent/tweet?text=${text}`;
                window.open(url, '_blank');
              }}
            >
              Compartilhar
            </Button>
          </div>

          {isLoadingButtons ? (
            <div className="flex justify-center my-4">
              <p>Carregando opções...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {buttons.map(button => (
                <Button
                  key={button.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Aqui implementaríamos a navegação ou ação específica do botão
                    console.log('Clicou no botão:', button.button_name);
                    // Exemplo: redirecionamento para chat ou assistente específico
                    // router.push(`/chat/${button.slug}?reference=${verseReference}&text=${encodeURIComponent(versesText)}`);
                  }}
                >
                  {button.button_name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
