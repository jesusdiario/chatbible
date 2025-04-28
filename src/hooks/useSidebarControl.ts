
import { useState } from "react";

export function useSidebarControl() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
  };
}
