
import React, { useRef } from 'react';
import { Verse, BibleVersion } from '@/types/biblia';
import VerseItem from './VerseItem';
import BookChapterTitle from './BookChapterTitle';

interface VersesListProps {
  verses: Verse[] | undefined;
  bookTitle: string;
  chapterTitle: string;
  version: BibleVersion;
  highlightVerse: number | null;
  selectedVerses: Verse[];
  onVerseSelect: (verse: Verse) => void;
  isFavorite: (verse: Verse) => boolean;
  onToggleFavorite: (verse: Verse) => void;
}

const VersesList: React.FC<VersesListProps> = ({
  verses,
  bookTitle,
  chapterTitle,
  version,
  highlightVerse,
  selectedVerses,
  onVerseSelect,
  isFavorite,
  onToggleFavorite
}) => {
  const highlightedVerseRef = useRef<HTMLDivElement | null>(null);

  if (!verses || verses.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>Não há versículos disponíveis para este capítulo.</p>
      </div>
    );
  }

  return (
    <>
      <BookChapterTitle bookName={bookTitle} chapter={chapterTitle} />
      
      {verses.map((verse) => {
        const isHighlighted = highlightVerse === verse.verse;
        const isSelected = selectedVerses.some(v => v.id === verse.id);
        const isFav = isFavorite(verse);
        
        return (
          <div
            key={verse.id}
            ref={isHighlighted ? highlightedVerseRef : null}
            className={`transition-colors ${
              isHighlighted ? 'bg-yellow-50' : ''
            } ${
              isSelected ? 'bg-blue-50' : ''
            }`}
          >
            <VerseItem
              verse={verse}
              version={version}
              onSelect={onVerseSelect}
              isFavorite={isFav}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        );
      })}
    </>
  );
};

export default VersesList;
