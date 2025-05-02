
import React, { createContext, useContext, useState } from 'react';
import { VerseWithReference } from '@/types/bible';

type SelectedVerseContextType = {
  selectedVerse: VerseWithReference | null;
  setSelectedVerse: (verse: VerseWithReference | null) => void;
};

const SelectedVerseContext = createContext<SelectedVerseContextType | undefined>(undefined);

export function SelectedVerseProvider({ children }: { children: React.ReactNode }) {
  const [selectedVerse, setSelectedVerse] = useState<VerseWithReference | null>(null);

  return (
    <SelectedVerseContext.Provider value={{ selectedVerse, setSelectedVerse }}>
      {children}
    </SelectedVerseContext.Provider>
  );
}

export function useSelectedVerse() {
  const context = useContext(SelectedVerseContext);
  if (context === undefined) {
    throw new Error('useSelectedVerse must be used within a SelectedVerseProvider');
  }
  return context;
}
