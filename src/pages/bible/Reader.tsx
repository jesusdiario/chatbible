
import React, { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBibleVerses } from '@/hooks/useBibleVerses';
import { useBookById } from '@/hooks/useBibleBooks';
import Verse from '@/components/bible/Verse';
import BottomNav from '@/components/bible/BottomNav';
import VerseActions from '@/components/bible/VerseActions';
import { useSelectedVerse } from '@/contexts/SelectedVerseContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

const Reader: React.FC = () => {
  const { id, chapter, verse } = useParams<{ id: string; chapter: string; verse?: string }>();
  const bookId = id ? parseInt(id, 10) : null;
  const chapterNum = chapter ? parseInt(chapter, 10) : null;
  const verseNum = verse ? parseInt(verse, 10) : null;
  const navigate = useNavigate();
  
  const [verseDialogOpen, setVerseDialogOpen] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const { selectedVerse, setSelectedVerse } = useSelectedVerse();
  
  const { data: book, isLoading: isLoadingBook } = useBookById(bookId);
  const { data: verses, isLoading: isLoadingVerses } = useBibleVerses(bookId, chapterNum);

  // Virtualização para performances com capítulos grandes (como Salmos 119)
  const virtualizer = useVirtualizer({
    count: verses?.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });
  
  useEffect(() => {
    if (!isLoadingVerses && verses?.length && verseNum) {
      const index = verses.findIndex(v => v.verse === verseNum);
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'start', behavior: 'smooth' });
      }
    }
  }, [isLoadingVerses, verses, verseNum, virtualizer]);

  const handleBack = () => {
    navigate(`/biblia/books/${bookId}`);
  };
  
  const goToPreviousChapter = () => {
    if (chapterNum && chapterNum > 1) {
      navigate(`/biblia/books/${bookId}/${chapterNum - 1}`);
    }
  };
  
  const goToNextChapter = () => {
    if (chapterNum) {
      navigate(`/biblia/books/${bookId}/${chapterNum + 1}`);
    }
  };
  
  const openVerseActions = () => {
    if (selectedVerse) {
      setVerseDialogOpen(true);
    }
  };
  
  // Título do capítulo (Se existir no verso 1)
  const chapterTitle = verses?.find(v => v.verse === 1)?.text.split('—')[1]?.trim();
  
  return (
    <div className="pb-20 min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white pt-8 pb-4 px-4 text-center">
        <h1 className="text-gray-600 text-xl mb-1">{book?.name || 'Carregando...'}</h1>
        <div className="text-[96px] md:text-7xl font-black leading-none">{chapterNum}</div>
        {chapterTitle && <p className="text-lg italic mt-2">{chapterTitle}</p>}
      </header>
      
      <div 
        ref={parentRef} 
        className="h-[calc(100vh-200px)] overflow-auto px-6 py-4"
      >
        {isLoadingVerses ? (
          <div className="flex justify-center items-center h-64">
            <p>Carregando versos...</p>
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const verse = verses[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <Verse verse={verse} onLongPress={openVerseActions} />
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="fixed bottom-16 left-0 right-0 flex justify-center p-2">
        <div className="bg-white rounded-full shadow-md flex items-center px-2">
          <button 
            onClick={goToPreviousChapter} 
            className="p-3 focus:outline-none"
            disabled={chapterNum === 1}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="px-4 font-medium">
            {book?.name} {chapterNum}
          </div>
          <button 
            onClick={goToNextChapter} 
            className="p-3 focus:outline-none"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <VerseActions 
        open={verseDialogOpen} 
        onOpenChange={setVerseDialogOpen} 
      />
      
      <BottomNav />
    </div>
  );
};

export default Reader;
