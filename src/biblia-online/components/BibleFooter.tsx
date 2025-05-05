
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface BibleFooterProps {
  bookName: string;
  chapter: number;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  onOpenBooksNav: () => void;
}

export const BibleFooter: React.FC<BibleFooterProps> = ({
  bookName,
  chapter,
  onPreviousChapter,
  onNextChapter,
  onOpenBooksNav,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="flex justify-between items-center px-4 py-2">
        <Button variant="ghost" onClick={onPreviousChapter} className="px-2 py-1">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex-1 font-medium"
          onClick={onOpenBooksNav}
        >
          {bookName} {chapter}
        </Button>
        
        <Button variant="ghost" onClick={onNextChapter} className="px-2 py-1">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
