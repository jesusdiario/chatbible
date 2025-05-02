
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SelectedVerseProvider } from '@/contexts/SelectedVerseContext';

const BibleRoot: React.FC = () => {
  return (
    <SelectedVerseProvider>
      <Outlet />
    </SelectedVerseProvider>
  );
};

export default BibleRoot;
