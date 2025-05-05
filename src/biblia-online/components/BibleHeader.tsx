
import React from 'react';
import { Button } from '@/components/ui/button';
import { BibleTranslation } from '../services/bibleService';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Menu, Search, MoreHorizontal } from 'lucide-react';
import { useSidebarControl } from '@/hooks/useSidebarControl';

interface BibleHeaderProps {
  bookName: string;
  chapter: number;
  onOpenBooksNav: () => void;
  currentTranslation: BibleTranslation;
  onChangeTranslation: (translation: BibleTranslation) => void;
}

export const BibleHeader: React.FC<BibleHeaderProps> = ({
  bookName,
  chapter,
  onOpenBooksNav,
  currentTranslation,
  onChangeTranslation,
}) => {
  const { toggleSidebar } = useSidebarControl();
  
  const getTranslationLabel = () => {
    switch (currentTranslation) {
      case BibleTranslation.NVI:
        return 'NVI';
      case BibleTranslation.ACF:
        return 'ACF';
      case BibleTranslation.ARA:
        return 'ARA';
      case BibleTranslation.ARC:
        return 'ARC';
      case BibleTranslation.NAA:
        return 'NAA';
      case BibleTranslation.NTLH:
        return 'NTLH';
      case BibleTranslation.NVT:
        return 'NVT';
      default:
        return 'NAA';
    }
  };

  const handleTranslationChange = (value: string) => {
    onChangeTranslation(value as BibleTranslation);
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white sticky top-0 z-10 border-b">
      <div className="flex space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <Search className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center">
        <Select 
          value={currentTranslation}
          onValueChange={handleTranslationChange}
        >
          <SelectTrigger className="px-4 py-2 rounded-full bg-gray-100 font-medium w-24">
            <SelectValue placeholder={getTranslationLabel()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={BibleTranslation.NAA}>NAA</SelectItem>
            <SelectItem value={BibleTranslation.NVI}>NVI</SelectItem>
            <SelectItem value={BibleTranslation.ACF}>ACF</SelectItem>
            <SelectItem value={BibleTranslation.ARA}>ARA</SelectItem>
            <SelectItem value={BibleTranslation.ARC}>ARC</SelectItem>
            <SelectItem value={BibleTranslation.NTLH}>NTLH</SelectItem>
            <SelectItem value={BibleTranslation.NVT}>NVT</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="ghost" 
          className="ml-2 font-medium"
          onClick={onOpenBooksNav}
        >
          {bookName} {chapter}
        </Button>
      </div>
    </div>
  );
};
