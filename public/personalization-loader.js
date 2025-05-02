/**
 * Redirector for the personalization loader
 * This file is just a fallback for sites that attempt to load from the /public path directly
 */
(function() {
  // Determine the base URL from the current script's source
  const scriptTag = document.currentScript || 
    document.querySelector('script[src*="personalization-loader.js"]');
    
  if (scriptTag) {
    const scriptSrc = scriptTag.src || '';
    const baseUrl = scriptSrc.replace('/public/personalization-loader.js', '');
    
    // Create and load the real script
    const realScript = document.createElement('script');
    realScript.src = `${baseUrl}/api?path=personalization-loader.js`;
    
    // Copy any data attributes
    for (let i = 0; i < scriptTag.attributes.length; i++) {
      const attr = scriptTag.attributes[i];
      if (attr.name.startsWith('data-')) {
        realScript.setAttribute(attr.name, attr.value);
      }
    }
    
    // Insert the new script after the current one
    scriptTag.parentNode.insertBefore(realScript, scriptTag.nextSibling);
    
    console.log('Redirected to the correct personalization loader URL');
  } else {
    console.error('Could not find personalization loader script tag');
  }
})();