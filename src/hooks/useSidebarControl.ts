
import { useState } from "react";

export function useSidebarControl() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState(""); // Added to match usage in other components

  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    apiKey,
    setApiKey,
  };
}
