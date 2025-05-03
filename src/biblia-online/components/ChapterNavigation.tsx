
import React from 'react';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChapterNavigationProps {
  bookName: string;
  chapterCount: number;
  currentChapter: number;
  onChapterSelect: (chapter: number) => void;
  onBack: () => void;
}

export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  bookName,
  chapterCount,
  currentChapter,
  onChapterSelect,
  onBack,
}) => {
  const handleSelect = (chapter: number) => {
    onChapterSelect(chapter);
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center p-4 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <h2 className="text-xl font-medium">{bookName}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapter) => (
            <Button
              key={chapter}
              variant="outline"
              className={`h-16 w-full text-lg ${chapter === currentChapter ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              onClick={() => handleSelect(chapter)}
            >
              {chapter}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
