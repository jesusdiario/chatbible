
import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Verse } from '../services/bibleService';
import { BibleButton } from '../hooks/useVerseSelection';
import { BibleTranslation } from '../services/bibleService';
import { ChevronUp, Share, Image, Compare, Pray } from 'lucide-react';

interface VerseActionBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verseReference: string;
  selectedVerses: Verse[];
  currentTranslation: BibleTranslation;
  buttons: BibleButton[];
  isLoadingButtons: boolean;
  getSelectedVersesText: (translation: string) => string;
}

export const VerseActionBottomSheet: React.FC<VerseActionBottomSheetProps> = ({
  open,
  onOpenChange,
  verseReference,
  selectedVerses,
  currentTranslation,
  buttons,
  isLoadingButtons,
  getSelectedVersesText
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[30vh] sm:h-[45vh] rounded-t-xl">
        <div className="py-4 px-4 flex flex-col h-full">
          <div className="flex flex-col items-center mb-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full mb-2"></div>
            <h3 className="text-lg font-medium">{verseReference}</h3>
          </div>
          
          <div className="flex-grow overflow-auto mb-4">
            {selectedVerses.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md text-sm">
                {getSelectedVersesText(currentTranslation)}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap justify-between gap-2 py-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Share className="h-5 w-5 mr-1" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Image className="h-5 w-5 mr-1" />
              Imagem
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Compare className="h-5 w-5 mr-1" />
              Compare
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Pray className="h-5 w-5 mr-1" />
              Orar
            </Button>
          </div>
          
          <div className="flex justify-center items-center mt-2 text-gray-500 text-sm">
            <ChevronUp className="h-4 w-4 mr-1" />
            Deslize para cima para ver mais
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
