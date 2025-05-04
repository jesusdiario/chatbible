
import React from 'react';
import { Button } from './ui/button';
import { ChevronDown, Menu } from 'lucide-react';
import { BibleTranslation } from '../services/bibleService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface BibleHeaderProps {
  bookName: string;
  chapter: number;
  onOpenBooksNav: () => void;
  onOpenChapterNav?: () => void;
  currentTranslation: BibleTranslation;
  onChangeTranslation: (translation: BibleTranslation) => void;
}

export const BibleHeader: React.FC<BibleHeaderProps> = ({
  bookName,
  chapter,
  onOpenBooksNav,
  onOpenChapterNav,
  currentTranslation,
  onChangeTranslation,
}) => {
  // Helper to convert translation enum to display name
  const getTranslationName = (translation: BibleTranslation): string => {
    switch (translation) {
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

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" onClick={onOpenBooksNav}>
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex items-center space-x-2" onClick={onOpenChapterNav || onOpenBooksNav}>
          <span className="font-medium text-lg">{bookName}</span>
          <span className="font-medium text-lg">{chapter}</span>
          <ChevronDown className="h-4 w-4" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {getTranslationName(currentTranslation)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onChangeTranslation(BibleTranslation.NVI)}>
              Nova Versão Internacional (NVI)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeTranslation(BibleTranslation.ACF)}>
              Almeida Corrigida Fiel (ACF)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeTranslation(BibleTranslation.ARA)}>
              Almeida Revista e Atualizada (ARA)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeTranslation(BibleTranslation.ARC)}>
              Almeida Revista e Corrigida (ARC)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeTranslation(BibleTranslation.NAA)}>
              Nova Almeida Atualizada (NAA)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeTranslation(BibleTranslation.NTLH)}>
              Nova Tradução na Linguagem de Hoje (NTLH)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeTranslation(BibleTranslation.NVT)}>
              Nova Versão Transformadora (NVT)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
