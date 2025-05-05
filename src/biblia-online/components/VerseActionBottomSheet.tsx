
import React from 'react';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Verse } from '../services/bibleService';
import { BibleButton } from '../hooks/useVerseSelection';
import { BibleTranslation } from '../services/bibleService';
import { ChevronUp, Share, Image, GitCompare, HandHelping } from 'lucide-react';

interface VerseActionBottomSheetProps {
  open: boolean;
  verseReference: string;
  selectedVerses: Verse[];
  currentTranslation: BibleTranslation;
  buttons: BibleButton[];
  isLoadingButtons: boolean;
  getSelectedVersesText: (translation: string) => string;
  onClose: () => void;
}

export const VerseActionBottomSheet: React.FC<VerseActionBottomSheetProps> = ({
  open,
  verseReference,
  selectedVerses,
  currentTranslation,
  buttons,
  isLoadingButtons,
  getSelectedVersesText,
  onClose
}) => {
  if (selectedVerses.length === 0) return null;
  
  // Mapeamento de slugs para ícones
  const iconMap: Record<string, React.ReactNode> = {
    'compartilhar': <Share className="w-6 h-6" />,
    'imagem': <Image className="w-6 h-6" />,
    'comparar': <GitCompare className="w-6 h-6" />,
    'orar': <HandHelping className="w-6 h-6" />
  };

  return (
    <Drawer.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] h-[60vh] mt-24 fixed bottom-0 left-0 right-0">
          <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-auto">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-4" />
            
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">{verseReference}</h3>
            </div>
            
            <ScrollArea className="h-[calc(60vh-180px)]">
              <div className="space-y-4 px-1">
                {/* Texto dos versículos selecionados */}
                <div className="prose prose-sm max-w-none">
                  {selectedVerses.map((verse) => {
                    const text = verse[currentTranslation] || 
                      verse.text_naa || 
                      verse.text_nvi || 
                      verse.text_acf || 
                      verse.text_ara || 
                      verse.text_ntlh || 
                      verse.text_nvt || 
                      '';
                    
                    return (
                      <p key={`${verse.book_id}-${verse.chapter}-${verse.verse}`} className="mb-3">
                        <span className="font-semibold text-gray-500">{verse.verse}</span> {text}
                      </p>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
            
            {/* Botões de ação */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {buttons.map((button) => (
                <Button
                  key={button.id}
                  variant="outline"
                  className="flex flex-col items-center justify-center h-20 py-2 px-1"
                  onClick={() => {
                    console.log(`Botão "${button.button_name}" clicado`);
                    console.log(`Prompt AI: ${button.prompt_ai}`);
                    console.log(`Versículos: ${getSelectedVersesText(currentTranslation)}`);
                  }}
                >
                  {iconMap[button.slug] || <div className="w-6 h-6" />}
                  <span className="text-xs mt-1">{button.button_name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="p-2 text-center border-t border-gray-200">
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
              <ChevronUp className="mr-2 h-4 w-4" />
              Deslize para cima para ver mais
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
