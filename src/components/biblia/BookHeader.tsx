
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Volume2, Menu, Search } from 'lucide-react';
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
  const [showVersions, setShowVersions] = useState(false);
  
  const toggleVersionsList = () => {
    setShowVersions(prev => !prev);
  };
  
  return (
    <header className="py-3 px-4 flex items-center justify-between border-b sticky top-0 bg-white z-10">
      <div className="flex items-center">
        <button className="p-2">
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="ml-4">
          <Search className="h-5 w-5" />
        </div>
      </div>
      
      <div className="flex items-center">
        <button 
          onClick={toggleVersionsList} 
          className="text-sm font-medium flex items-center"
        >
          {version.toUpperCase()} <ChevronLeft className={`h-4 ml-1 transition-transform ${showVersions ? 'rotate-90' : '-rotate-90'}`} />
        </button>
        
        <div className="ml-2 text-lg">
          {bookTitle} {chapterTitle}
        </div>
      </div>
      
      <div className="flex items-center">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Volume2 className="h-5 w-5" />
        </button>
      </div>
      
      {showVersions && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-md z-20 py-1">
          {['naa', 'nvi', 'acf', 'ara', 'arc', 'ntlh', 'nvt'].map((v) => (
            <button
              key={v}
              className={`w-full text-left px-4 py-2 ${version === v ? 'font-bold' : ''}`}
              onClick={() => {
                setVersion(v as BibleVersion);
                setShowVersions(false);
              }}
            >
              {v === version && <span className="mr-2">✓</span>}
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default BookHeader;
