
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Volume2 } from 'lucide-react';

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
        
        <div className="flex-1"></div>
        
        <Button variant="ghost" size="icon" className="ml-2">
          <span className="font-bold text-xl">AZ</span>
        </Button>
        
        <Button variant="ghost" size="icon" className="ml-2">
          <span className="rounded-full border p-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapter) => (
            <Button
              key={chapter}
              variant="outline"
              className={`h-16 w-full text-lg ${chapter === currentChapter ? 'bg-bible-accent text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
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
