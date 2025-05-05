
import React, { useEffect } from 'react';
import { detectReloadTriggers } from "@/utils/debugUtils";

interface DebugProviderProps {
  children: React.ReactNode;
}

export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
  useEffect(() => {
    // Enable debug tools in development
    if (import.meta.env.DEV) {
      try {
        detectReloadTriggers();
      } catch (err) {
        console.error('Failed to initialize debug utilities:', err);
      }
    }
  }, []);

  return <>{children}</>;
};

export default DebugProvider;
