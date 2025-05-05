
import { useState, useEffect } from "react";

export function useSidebarControl() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState(""); // Kept to match usage in other components

  const toggleSidebar = () => {
    console.log("Toggling sidebar, current state:", isSidebarOpen);
    setIsSidebarOpen(prev => !prev);
  };

  // Close sidebar when clicking outside on mobile devices
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isSidebarOpen && window.innerWidth < 768) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-sidebar="true"]') && !target.closest('button[aria-label="Toggle Sidebar"]')) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isSidebarOpen]);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    setApiKey, // Exported to fix the type error
  };
}
