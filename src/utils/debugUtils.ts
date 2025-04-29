
/**
 * Utility functions for debugging application behavior
 */

/**
 * Detects and logs potential page reload triggers
 */
export const detectReloadTriggers = () => {
  // Monitor reload events by wrapping in a try-catch
  try {
    // Use a proxy method instead of directly replacing window.location.reload
    const originalReload = window.location.reload;
    
    // Create a wrapper function to log reload attempts
    const logReload = () => {
      console.warn('Page reload detected:', new Error().stack);
      originalReload.apply(window.location);
    };
    
    // Track reload attempts using event listeners instead of property reassignment
    window.addEventListener('beforeunload', (e) => {
      console.log('Page unload triggered at:', new Date().toISOString());
      // Don't prevent the unload here, just log it
    });

    // Monitor visibility changes
    document.addEventListener('visibilitychange', () => {
      console.log(`Document visibility changed to: ${document.visibilityState} at ${new Date().toISOString()}`);
    });
    
    // Add global monitoring function for debugging
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
    });

    console.log('Reload detection enabled (monitoring mode)');
  } catch (err) {
    console.error('Failed to initialize reload detection:', err);
  }
};
