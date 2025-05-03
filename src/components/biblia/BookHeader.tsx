
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, VolumeIcon } from 'lucide-react';
import { BibleVersion } from '@/types/biblia';
import BibleVersionSelector from './BibleVersionSelector';

interface BookHeaderProps {
  bookTitle: string;
  chapterTitle: string;
  version: BibleVersion;
  setVersion: (version: BibleVersion) => void;
}

const BookHeader: React.FC<BookHeaderProps> = ({ 
  bookTitle, 
  chapterTitle, 
  version, 
  setVersion 
}) => {
  return (
    <header className="py-3 px-4 flex items-center justify-between border-b sticky top-0 bg-white z-10">
      <div className="flex items-center">
        <Link to="/biblia" className="mr-3">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">{bookTitle} {chapterTitle}</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <VolumeIcon className="h-5 w-5" />
        </button>
        
        <div>
          <BibleVersionSelector 
            version={version} 
            onChange={setVersion}
          />
        </div>
      </div>
    </header>
  );
};

export default BookHeader;
