
import { useState } from "react";

export function useSidebarControl() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('openai_api_key') || '');

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
  };

  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    apiKey,
    setApiKey: handleApiKeyChange,
    toggleSidebar,
  };
}
