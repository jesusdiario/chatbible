
/**
 * Utility functions for debugging application behavior
 */

/**
 * Detects and logs potential page reload triggers
 */
export const detectReloadTriggers = () => {
  // Intercept window.location.reload calls
  const originalReload = window.location.reload;
  window.location.reload = function() {
    console.warn('Page reload triggered by:', new Error().stack);
    return originalReload.apply(this, arguments as any);
  };

  // Log navigation events
  window.addEventListener('beforeunload', (e) => {
    console.log('Page unload triggered');
    // Don't prevent the unload here, just log it
  });

  // Monitor visibility changes
  document.addEventListener('visibilitychange', () => {
    console.log(`Document visibility changed to: ${document.visibilityState}`);
  });

  console.log('Reload detection enabled');
};
