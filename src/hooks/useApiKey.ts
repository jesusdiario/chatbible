
import { useState, useEffect } from 'react';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>('');

  // Load API key from localStorage when component mounts
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      // If it doesn't exist in localStorage, save default key
      const defaultKey = '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';
      localStorage.setItem('openai_api_key', defaultKey);
      setApiKey(defaultKey);
    }
  }, []);

  // Function to handle API key change
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('openai_api_key', newApiKey);
    return true;
  };

  return {
    apiKey,
    handleApiKeyChange
  };
};
