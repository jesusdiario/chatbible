
import { useState } from 'react';

export function useSidebarState() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return {
    isSidebarOpen,
    setIsSidebarOpen
  };
}
