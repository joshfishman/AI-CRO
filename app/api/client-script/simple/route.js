export async function OPTIONS(request) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '*';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function GET(request) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '*';
  
  // Host URL (for API requests)
  const host = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-cro-three.vercel.app';
  
  // Set CORS headers to allow the script to be loaded from any domain
  const headers = {
    'Content-Type': 'application/javascript',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Cache-Control': 'max-age=3600'
  };

  // Create a simpler version of the client script without complex templating
  const clientScript = `
    (function() {
      // Create the AICRO namespace if it doesn't exist
      if (typeof window.AICRO === 'undefined') {
        window.AICRO = {};
      }
      
      // Configuration object
      var config = {
        apiHost: "${host}",
        userId: null,
        debug: false,
        initialized: false
      };
      
      // Simple debug function
      AICRO.debug = function(enable) {
        config.debug = !!enable;
        return AICRO;
      };
      
      // Initialize function that works cross-platform
      AICRO.init = function(options) {
        if (config.initialized) {
          if (config.debug) console.log('[AI CRO] Already initialized');
          return AICRO;
        }
        
        // Merge options
        options = options || {};
        for (var key in options) {
          if (options.hasOwnProperty(key)) {
            config[key] = options[key];
          }
        }
        
        if (config.debug) console.log('[AI CRO] Initializing with config:', config);
        
        config.initialized = true;
        return AICRO;
      };
      
      // Open selector function
      AICRO.openSelector = function() {
        var script = document.createElement('script');
        script.src = '${host}/api/selector-module';
        document.head.appendChild(script);
        return AICRO;
      };
      
      // Simple function to log status
      AICRO.status = function() {
        console.log('[AI CRO] Status:', {
          initialized: config.initialized,
          debug: config.debug,
          apiHost: config.apiHost
        });
        return AICRO;
      };
      
      // Auto-initialize from URL parameter
      function checkSelectorParam() {
        try {
          var searchParams = new URLSearchParams(window.location.search);
          if (searchParams.has('aicro_selector') || searchParams.has('aicro-selector')) {
            if (config.debug) console.log('[AI CRO] Selector mode detected in URL');
            
            if (!config.initialized) {
              AICRO.debug(true).init();
            }
            
            setTimeout(function() {
              AICRO.openSelector();
            }, 500);
          }
        } catch (e) {
          console.error('[AI CRO] Error checking selector param:', e);
        }
      }
      
      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkSelectorParam);
      } else {
        checkSelectorParam();
      }
      
      console.log('[AI CRO] Client script loaded. Use AICRO.debug(true).init()');
    })();
  `;

  return new Response(clientScript, { headers });
} 