/**
 * Redirector for the selector bookmarklet
 * This file is just a fallback for sites that attempt to load from the /public path directly
 */
(function() {
  // Determine the base URL from the current script's source
  const scriptTag = document.currentScript || 
    document.querySelector('script[src*="selector-bookmarklet.js"]');
    
  if (scriptTag) {
    const scriptSrc = scriptTag.src || '';
    const baseUrl = scriptSrc.replace('/selector-bookmarklet.js', '');
    
    // Create and load the real script
    const realScript = document.createElement('script');
    realScript.src = `${baseUrl}/api?path=selector-bookmarklet.js`;
    
    // Add the script to the document
    document.body.appendChild(realScript);
    
    console.log('Redirected to the correct selector bookmarklet URL');
  } else {
    console.error('Could not find selector bookmarklet script tag');
  }
})(); 