
import React from 'react';
import { BibleTranslation, Verse } from '../services/bibleService';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, X } from 'lucide-react';
import { BibleButton } from '../hooks/useVerseSelection';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

interface VerseActionBottomSheetProps {
  open: boolean;
  onClose: () => void;
  verseReference: string;
  selectedVerses: Verse[];
  currentTranslation: BibleTranslation;
  buttons: BibleButton[];
  isLoadingButtons: boolean;
  getSelectedVersesText: (translation: string) => string;
}

export const VerseActionBottomSheet: React.FC<VerseActionBottomSheetProps> = ({
  open,
  onClose,
  verseReference,
  selectedVerses,
  currentTranslation,
  buttons,
  isLoadingButtons,
  getSelectedVersesText
}) => {
  if (!open) return null;

  return (
    <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle className="text-center">{verseReference}</DrawerTitle>
            <DrawerDescription className="text-center">
              {selectedVerses.length} versículo(s) selecionado(s)
            </DrawerDescription>
          </DrawerHeader>
          
          <ScrollArea className="px-4 max-h-48">
            <div className="space-y-2 mb-4 text-sm">
              {selectedVerses.map((verse) => {
                const text = verse[currentTranslation] || 
                            verse.text_naa || 
                            verse.text_nvi || 
                            verse.text_acf || 
                            verse.text_ara || 
                            verse.text_ntlh || 
                            verse.text_nvt || '';
                            
                return (
                  <p key={`${verse.book_id}-${verse.chapter}-${verse.verse}`} className="mb-2">
                    <span className="font-bold text-gray-500">{verse.verse}</span>{" "}
                    {text}
                  </p>
                );
              })}
            </div>
          </ScrollArea>
          
          <div className="px-4">
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {isLoadingButtons ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                buttons.map((button) => (
                  <Button 
                    key={button.id}
                    variant="outline"
                    className="flex-1 min-w-[120px]"
                    onClick={() => {
                      // Aqui implementaremos a ação do botão em futuros requisitos
                      console.log(`Botão ${button.button_name} clicado para ${verseReference}`);
                      console.log('Texto completo:', getSelectedVersesText(currentTranslation));
                    }}
                  >
                    {button.button_name}
                  </Button>
                ))
              )}
            </div>
          </div>
          
          <DrawerFooter className="flex-row justify-between border-t pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Limpar seleção
            </Button>
            <DrawerClose asChild>
              <Button variant="ghost" className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
