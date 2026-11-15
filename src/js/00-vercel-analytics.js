/* Vercel Web Analytics integration.
   This is loaded separately from the custom analytics layer and provides standard Vercel page view tracking.
   The @vercel/analytics package is bundled via a script tag from node_modules. */
(function(){
'use strict';
/* This script expects the Vercel Analytics inject function to be available.
   In production on Vercel, the analytics will automatically be injected via the deployment.
   For local development and testing, we need to manually inject it. */

// Initialize the queue for Vercel Analytics
if (typeof window !== 'undefined' && !window.va) {
  window.va = function va(...params) {
    if (!window.vaq) window.vaq = [];
    window.vaq.push(params);
  };
}

// Try to inject Vercel Analytics if the inject function is available
try {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Load the analytics script
    var script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    script.onerror = function() {
      // Silently fail if script cannot be loaded (e.g., in local development without Vercel)
      if (window.console && window.console.log) {
        console.log('[Vercel Analytics] Script not loaded - this is normal in local development');
      }
    };
    
    // Append script to head or document element
    var target = document.head || document.documentElement;
    if (target) {
      target.appendChild(script);
    }
  }
} catch (e) {
  // Silently handle any errors
  if (window.console && window.console.warn) {
    console.warn('[Vercel Analytics] Initialization error:', e);
  }
}
})();
