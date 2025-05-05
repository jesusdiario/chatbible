
import React from 'react';
import { BibleButton } from '../hooks/useVerseSelection';
import { Verse, BibleTranslation } from '../services/bibleService';
import { Button } from '@/components/ui/button';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from '@/components/ui/drawer';
import { X, Share, Image, BookOpen, BookOpenCheck } from 'lucide-react';

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
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-bold">{verseReference}</DrawerTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          {/* Selected Verses */}
          <div className="px-4 mb-4 max-h-[30vh] overflow-y-auto">
            {selectedVerses.map((verse) => (
              <div key={`${verse.book_id}-${verse.chapter}-${verse.verse}`} className="mb-2 p-2 border-b">
                <p className="text-sm text-gray-500">{verse.book_name} {verse.chapter}:{verse.verse}</p>
                <p>
                  {verse[currentTranslation] || 
                    verse.text_naa || 
                    verse.text_nvi || 
                    verse.text_acf || 
                    verse.text_ara || 
                    verse.text_ntlh || 
                    verse.text_nvt || ''}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2 px-4 pb-8">
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Share className="h-5 w-5 mb-1" />
              <span className="text-xs">Compartilhar</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Image className="h-5 w-5 mb-1" />
              <span className="text-xs">Imagem</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <BookOpen className="h-5 w-5 mb-1" />
              <span className="text-xs">Compare</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <BookOpenCheck className="h-5 w-5 mb-1" />
              <span className="text-xs">Orar</span>
            </Button>
          </div>
          
          {/* Bible Buttons from Database */}
          {buttons.length > 0 && (
            <div className="px-4 pb-8">
              <h3 className="font-medium mb-2">Ações com IA</h3>
              <div className="grid grid-cols-2 gap-2">
                {buttons.map((button) => (
                  <Button 
                    key={button.id} 
                    variant="outline" 
                    className="flex items-center justify-center p-2"
                  >
                    <span>{button.button_name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
