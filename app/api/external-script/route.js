import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'text/javascript'
    }
  });
}

export async function GET(request) {
  // Get the host URL (for any dynamic references needed in the script)
  const host = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://ai-cro-three.vercel.app';
  
  // URL for the selector module
  const selectorUrl = `${host}/api/selector-module`;
  
  // Debug mode detection
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === 'true';
  
  // The actual JavaScript content to be delivered
  const jsContent = `
/**
 * AI CRO External Script
 * Version: 1.0.0
 * Properly configured for cross-origin execution
 */
(function(window, document) {
  // Log initialization if in debug mode
  ${debug ? `console.log('[AI CRO] External script loaded from ${host}');` : ''}
  
  // Create global namespace if it doesn't exist
  if (!window.AICRO) {
    window.AICRO = {
      _debug: ${debug},
      _initialized: false,
      _host: "${host}",
      
      // Debug method
      debug: function(enable) {
        this._debug = enable === true;
        if (this._debug) {
          console.log('[AI CRO] Debug mode enabled');
        }
        return this;
      },
      
      // Init method
      init: function(config) {
        if (this._initialized) {
          this._debug && console.log('[AI CRO] Already initialized');
          return this;
        }
        
        config = config || {};
        this._config = config;
        this._initialized = true;
        
        this._debug && console.log('[AI CRO] Initialized with config:', config);
        
        // Add initialization logic here
        
        return this;
      },
      
      // Load selector module
      loadSelector: function() {
        this._debug && console.log('[AI CRO] Loading selector module...');
        
        return new Promise((resolve, reject) => {
          // Create script element
          const script = document.createElement('script');
          script.src = "${selectorUrl}";
          script.async = true;
          script.crossOrigin = "anonymous";
          
          // Set up load handlers
          script.onload = () => {
            this._debug && console.log('[AI CRO] Selector module loaded successfully');
            resolve();
          };
          
          script.onerror = (err) => {
            console.error('[AI CRO] Failed to load selector module:', err);
            reject(err);
          };
          
          // Add to document
          document.head.appendChild(script);
        });
      }
    };
  }
  
  // Ensure we're not redefining the AICRO object if it already exists
  const AICRO = window.AICRO;
  
  // Auto-initialize if data attribute is present
  const scripts = document.querySelectorAll('script[data-aicro-auto-init]');
  if (scripts.length > 0) {
    AICRO._debug && console.log('[AI CRO] Auto-initialization detected');
    AICRO.init();
  }
  
})(window, document);
  `;
  
  // Return the JavaScript with proper headers
  return new Response(jsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
} 