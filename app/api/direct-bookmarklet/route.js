import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Get the host URL
  const host = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://ai-cro-three.vercel.app';
  
  // Create a bookmarklet that loads our external script and immediately activates the selector
  const bookmarkletCode = `(function() {
    // Show loading indicator
    var loadingDiv = document.createElement('div');
    loadingDiv.style.position = 'fixed';
    loadingDiv.style.top = '20px';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translateX(-50%)';
    loadingDiv.style.background = 'white';
    loadingDiv.style.padding = '10px 20px';
    loadingDiv.style.borderRadius = '8px';
    loadingDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    loadingDiv.style.zIndex = '1000000';
    loadingDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    loadingDiv.style.fontSize = '14px';
    loadingDiv.textContent = 'Loading AI CRO Selector...';
    document.body.appendChild(loadingDiv);
    
    // Function to load the main script
    function loadMainScript() {
      return new Promise(function(resolve, reject) {
        var script = document.createElement('script');
        script.src = '${host}/api/external-script?debug=true';
        script.async = true;
        script.crossOrigin = "anonymous";
        
        script.onload = function() {
          console.log('[AI CRO] Main script loaded successfully');
          resolve();
        };
        
        script.onerror = function(error) {
          console.error('[AI CRO] Failed to load main script:', error);
          reject(error);
        };
        
        document.head.appendChild(script);
      });
    }
    
    // Start loading process
    loadMainScript()
      .then(function() {
        // Wait for initialization
        if (window.AICRO) {
          // Load the selector module
          loadingDiv.textContent = 'Loading selector module...';
          return window.AICRO.loadSelector();
        } else {
          throw new Error('AICRO global object not found after script load');
        }
      })
      .then(function() {
        // Start the selector
        loadingDiv.textContent = 'Starting element selection...';
        
        // Small delay to ensure UI is ready
        setTimeout(function() {
          if (window.AICRO && window.AICRO.startSelector) {
            window.AICRO.startSelector();
            // Remove the loading indicator
            document.body.removeChild(loadingDiv);
          } else {
            throw new Error('Selector module not properly initialized');
          }
        }, 500);
      })
      .catch(function(error) {
        console.error('[AI CRO] Error in bookmarklet:', error);
        loadingDiv.textContent = 'Error: ' + (error.message || 'Failed to load AI CRO');
        loadingDiv.style.color = 'red';
        
        // Remove the error message after 5 seconds
        setTimeout(function() {
          if (document.body.contains(loadingDiv)) {
            document.body.removeChild(loadingDiv);
          }
        }, 5000);
      });
  })();`;
  
  // URL encode the bookmarklet code (important for cross-browser compatibility)
  const encodedBookmarklet = `javascript:${encodeURIComponent(bookmarkletCode)}`;
  
  return new Response(encodedBookmarklet, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
} 