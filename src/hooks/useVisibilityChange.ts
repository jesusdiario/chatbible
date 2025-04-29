
import { useEffect, useRef } from 'react';

type VisibilityCallback = () => void;

export const useVisibilityChange = (onVisibilityChange: VisibilityCallback) => {
  const visibilityTimeoutRef = useRef<number | null>(null);
  const lastVisibilityState = useRef<string>(document.visibilityState);
  const pausedRef = useRef<boolean>(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const currentState = document.visibilityState;
      
      // Log state changes for debugging
      console.log(`Visibility changed from ${lastVisibilityState.current} to ${currentState} at ${new Date().toISOString()}`);
      
      // Only execute actions when there's a real change in visibility state
      if (currentState !== lastVisibilityState.current) {
        lastVisibilityState.current = currentState;
        
        // Clear any pending timeout
        if (visibilityTimeoutRef.current !== null) {
          window.clearTimeout(visibilityTimeoutRef.current);
          visibilityTimeoutRef.current = null;
        }

        // We'll only invoke the callback if explicitly requested via props
        // and only when returning to visible state (not when leaving)
        if (currentState === 'visible' && !pausedRef.current && onVisibilityChange) {
          // Add a small delay to avoid multiple rapid visibility changes
          visibilityTimeoutRef.current = window.setTimeout(() => {
            console.log('Invoking visibility change callback at', new Date().toISOString());
            onVisibilityChange();
            visibilityTimeoutRef.current = null;
          }, 300);
        }
      }
    };

    // Attach event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityTimeoutRef.current !== null) {
        window.clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [onVisibilityChange]);

  // Return a control function to pause/resume the visibility callback
  return {
    pause: () => { pausedRef.current = true; },
    resume: () => { pausedRef.current = false; }
  };
};
