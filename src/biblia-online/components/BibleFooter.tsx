
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home,
  Book,
  Search,
  MoreHorizontal
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex-1 font-medium"
          onClick={onOpenBooksNav}
        >
          {bookName} {chapter}
        </Button>
        
        <Button variant="ghost" onClick={onNextChapter} className="px-2 py-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Button>
      </div>
      
      <div className="flex justify-around border-t py-2">
        <Button variant="ghost" className="flex-col h-auto py-1">
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Início</span>
        </Button>
        
        <Button variant="ghost" className="flex-col h-auto py-1">
          <Book className="h-5 w-5" />
          <span className="text-xs mt-1">Bíblia</span>
        </Button>
        
        <Button variant="ghost" className="flex-col h-auto py-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="10" x2="15" y2="10" />
            <line x1="12" y1="7" x2="12" y2="13" />
          </svg>
          <span className="text-xs mt-1">Planos</span>
        </Button>
        
        <Button variant="ghost" className="flex-col h-auto py-1">
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Descubra</span>
        </Button>
        
        <Button variant="ghost" className="flex-col h-auto py-1">
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-xs mt-1">Mais</span>
        </Button>
      </div>
    </div>
  );
};
