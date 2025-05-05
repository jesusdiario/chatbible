
import React from 'react';
import { BibleVerse } from './BibleVerse';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { Chapter, BibleTranslation } from '../services/bibleService';
import { Verse } from '../services/bibleService';

interface BibleContentProps {
  isLoading: boolean;
  chapterData: Chapter | null;
  error: string | null;
  currentTranslation: BibleTranslation;
  selectedVerses: Verse[];
  onVerseSelect: (verse: Verse) => void;
  isVerseSelected: (verse: Verse) => boolean;
}

export const BibleContent: React.FC<BibleContentProps> = ({
  isLoading,
  chapterData,
  error,
  currentTranslation,
  selectedVerses,
  onVerseSelect,
  isVerseSelected
}) => {
  // Render empty or error state
  const renderEmptyOrError = () => {
    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-64 text-gray-500">
          <p className="mb-2 text-red-500">{error}</p>
          <p>Tente selecionar outro livro ou capítulo</p>
        </div>
      );
    }
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Nenhum conteúdo disponível
      </div>
    );
  };

  return (
    <ScrollArea className="flex-1 pb-32">
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-500">Carregando conteúdo...</p>
        </div>
      ) : chapterData && chapterData.verses && chapterData.verses.length > 0 ? (
        <div className="p-4 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl text-gray-500 font-medium mb-2">{chapterData.book_name}</h1>
            <h2 className="text-8xl font-bold mb-6">{chapterData.chapter}</h2>
          </div>
          
          <div className="mt-8 mb-32">
            {chapterData.verses.map(verse => (
              <BibleVerse 
                key={verse.id} 
                verse={verse} 
                translation={currentTranslation} 
                showActions={true}
                isSelected={isVerseSelected(verse)}
                onSelect={onVerseSelect}
              />
            ))}
          </div>
        </div>
      ) : (
        renderEmptyOrError()
      )}
    </ScrollArea>
  );
};
