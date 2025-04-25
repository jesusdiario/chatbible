
import { useEffect } from 'react';

type VisibilityCallback = () => void;

export const useVisibilityChange = (onVisibilityChange: VisibilityCallback) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        onVisibilityChange();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onVisibilityChange]);
};
