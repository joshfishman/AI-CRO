export async function OPTIONS(request) {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function GET(request) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '*';
  
  // Host URL (for API requests)
  const host = process.env.NEXT_PUBLIC_SITE_URL 
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://ai-cro-three.vercel.app';
  
  // Get possible override from query param
  const url = new URL(request.url);
  const hostOverride = url.searchParams.get('host');
  
  // Final host URL to use, preferring the override if provided
  const finalHost = hostOverride || host;
  
  // Check if the bookmarklet helper should be activated
  const showBookmarklet = url.searchParams.get('bookmarklet') === 'true';
  
  // If the bookmarklet parameter is present, return the bookmarklet helper UI instead
  if (showBookmarklet) {
    // Create a simple but effective bookmarklet that loads the selector module
    const bookmarkletScript = `
      (function() {
        // Check if already loaded
        if (window.AICRO_SELECTOR_ACTIVE) {
          alert('AI CRO selector is already active');
          return;
        }
        
        // Show loading notification
        var notice = document.createElement('div');
        notice.id = 'aicro-loading-notice';
        notice.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#4CAF50;color:white;padding:8px 16px;border-radius:4px;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
        notice.textContent = 'Loading AI CRO Element Selector...';
        document.body.appendChild(notice);
        
        // Create a debug helper
        var debugDiv = document.createElement('div');
        debugDiv.id = 'aicro-debug';
        debugDiv.style.cssText = 'position:fixed;bottom:80px;right:20px;background:#f8f9fa;color:#333;padding:12px;border-radius:4px;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,0.2);max-width:400px;font-family:monospace;font-size:12px;overflow:auto;max-height:200px;';
        debugDiv.innerHTML = '<strong>AI CRO Debug:</strong><br>Initializing...';
        document.body.appendChild(debugDiv);
        
        function debugLog(message) {
          var debug = document.getElementById('aicro-debug');
          if (debug) {
            debug.innerHTML += '<br>' + message;
          }
          console.log('[AI CRO Debug]', message);
        }
        
        // Log the loading process
        debugLog('Loading selector module from: ${finalHost}/api/selector-module/simple');
        
        // Load the full selector module script
        var script = document.createElement('script');
        script.src = '${finalHost}/api/selector-module/simple';
        script.async = true;
        
        // Handle loading success
        script.onload = function() {
          debugLog('Selector module loaded successfully!');
          notice.style.background = '#10b981';
          notice.textContent = 'AI CRO Element Selector loaded successfully!';
          setTimeout(function() {
            document.body.removeChild(notice);
          }, 3000);
        };
        
        // Handle loading errors
        script.onerror = function(error) {
          debugLog('Error loading selector module: ' + error);
          notice.style.background = '#f44336';
          notice.textContent = 'Error loading AI CRO Element Selector. Check debug console.';
          
          // Try alternative loading method with fetch
          debugLog('Trying alternative loading method...');
          fetch('${finalHost}/api/selector-module/simple')
            .then(function(response) {
              if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
              }
              return response.text();
            })
            .then(function(scriptText) {
              debugLog('Script fetched successfully, evaluating...');
              var scriptEl = document.createElement('script');
              scriptEl.textContent = scriptText;
              document.head.appendChild(scriptEl);
              
              notice.style.background = '#10b981';
              notice.textContent = 'AI CRO Element Selector loaded via alternative method!';
              setTimeout(function() {
                document.body.removeChild(notice);
              }, 3000);
            })
            .catch(function(error) {
              debugLog('Alternative loading failed: ' + error.message);
              notice.textContent = 'Failed to load AI CRO Element Selector. See debug log.';
            });
        };
        
        // Add to page
        document.head.appendChild(script);
      })();
    `;
    
    // Create a bookmarklet helper page
    const bookmarkletCode = `javascript:${encodeURIComponent(bookmarkletScript)}`;
    const helperHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>AI CRO Bookmarklet Helper</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #2563eb;
          margin-bottom: 24px;
        }
        .bookmarklet-container {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 24px;
          text-align: center;
        }
        .bookmarklet {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          text-decoration: none;
          margin: 12px 0;
        }
        .instructions {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
        }
        .code {
          background: #f1f5f9;
          padding: 12px;
          border-radius: 4px;
          font-family: monospace;
          overflow-x: auto;
        }
        .troubleshooting {
          margin-top: 30px;
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 24px;
        }
      </style>
    </head>
    <body>
      <h1>AI CRO Element Selector Bookmarklet</h1>
      
      <div class="bookmarklet-container">
        <p>Drag this button to your bookmarks bar:</p>
        <a href="${bookmarkletCode}" class="bookmarklet">AI CRO Selector</a>
        <p><small>This bookmarklet includes error handling and debugging features</small></p>
      </div>
      
      <div class="instructions">
        <h2>How to use:</h2>
        <ol>
          <li>Drag the button above to your bookmarks bar.</li>
          <li>Navigate to any page where you want to test content variations.</li>
          <li>Click the "AI CRO Selector" bookmark to activate the selection tool.</li>
          <li>If you see any errors, check the debug log that appears in the bottom right corner.</li>
          <li>Select elements and create content variations.</li>
        </ol>
        
        <h2>After creating variations:</h2>
        <p>Add the AI CRO script to your website:</p>
        <div class="code">&lt;script src="${finalHost}/api/aicro-script"&gt;&lt;/script&gt;</div>
        
        <p>And initialize it:</p>
        <div class="code">&lt;script&gt;
  document.addEventListener('DOMContentLoaded', function() {
    if (window.AICRO && typeof window.AICRO.init === 'function') {
      AICRO.debug(true) // Enable debug mode (remove in production)
        .init();
    } else {
      console.error("AICRO is not defined. Make sure the script loaded correctly.");
    }
  });
&lt;/script&gt;</div>
      </div>
      
      <div class="troubleshooting">
        <h2>Troubleshooting:</h2>
        <ol>
          <li><strong>If the script fails to load:</strong> Check your browser's console for errors.</li>
          <li><strong>CORS issues:</strong> This version handles CORS properly, but if problems persist, you may need to use a CORS browser extension.</li>
          <li><strong>Script not working:</strong> Try using the debug panel for more information.</li>
          <li><strong>Webflow specific:</strong> Make sure you're using the correct script URL and that it's placed in the appropriate location.</li>
        </ol>
      </div>
    </body>
    </html>
    `;
    
    return new Response(helperHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'max-age=3600'
      }
    });
  }
  
  // Set CORS headers to allow the script to be loaded from any domain
  const headers = {
    'Content-Type': 'application/javascript',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'max-age=3600'
  };

  const clientScript = `
    // AI CRO Client Library - Self-initializing version for header inclusion
    (function() {
      console.log('[AI CRO] Loading AICRO script');
      
      // Create the base object
      window.AICRO = window.AICRO || {};
      
      // Configuration
      const config = {
        apiHost: "${finalHost}",
        userId: null,
        debug: false,
        initialized: false,
        testData: {},
        gtm: {
          enabled: true,
          dataLayerName: 'dataLayer'
        },
        autoDetection: {
          enabled: false,
          headings: true,
          buttons: true,
          images: false,
          callToAction: true,
          productDescriptions: true,
          banners: true
        },
        autoPersonalizationRules: [],
        pageAudience: '',
        pageIntent: '',
        pageSettings: {}
      };
      
      // Debug/logging helper
      function log(...args) {
        if (config.debug) {
          console.log("[AI CRO]", ...args);
        }
      }
      
      // Define all methods on the AICRO object upfront
      Object.assign(AICRO, {
        // Load saved page settings for the current URL if they exist
        loadPageSettings: function() {
          try {
            // Use normalized URL as key (without query parameters)
            const urlKey = window.location.origin + window.location.pathname;
            const storageKey = 'AICRO_PAGE_SETTINGS_' + urlKey.replace(/[^a-z0-9]/gi, '_');
            
            const savedSettings = localStorage.getItem(storageKey);
            if (savedSettings) {
              const settings = JSON.parse(savedSettings);
              
              // Apply saved settings to config
              if (settings.audience) config.pageAudience = settings.audience;
              if (settings.intent) config.pageIntent = settings.intent;
              
              // Store complete settings object
              config.pageSettings = settings;
              
              if (config.debug) {
                console.log('[AI CRO] Loaded page settings:', settings);
              }
              
              return settings;
            }
          } catch (e) {
            console.error('[AI CRO] Error loading page settings:', e);
          }
          
          return null;
        },
        
        // Add bookmarklet functionality - can be accessed via AICRO.openSelector()
        openSelector: function() {
          // Create and inject the bookmarklet code
          const script = document.createElement('script');
          script.src = '${finalHost}/api/selector-module/simple';
          script.async = true;
          
          // Add error handling
          script.onerror = function(error) {
            console.error('[AI CRO] Error loading selector module from ' + script.src, error);
            
            // Try alternative loading method with fetch
            console.log('[AI CRO] Trying alternative loading method...');
            fetch('${finalHost}/api/selector-module/simple')
              .then(function(response) {
                if (!response.ok) {
                  throw new Error('Network response was not ok: ' + response.status);
                }
                return response.text();
              })
              .then(function(scriptText) {
                console.log('[AI CRO] Script fetched successfully, evaluating...');
                var scriptEl = document.createElement('script');
                scriptEl.textContent = scriptText;
                document.head.appendChild(scriptEl);
              })
              .catch(function(error) {
                console.error('[AI CRO] Alternative loading also failed:', error);
                alert('Error loading AI CRO selector module. Please check the console for details.');
              });
          };
          
          document.head.appendChild(script);
          return this;
        },
        
        // Function to check if script can be loaded from a URL
        testConnection: function(url) {
          url = url || config.apiHost + '/api/selector-module/simple';
          console.log('[AI CRO] Testing connection to: ' + url);
          
          return fetch(url, { 
            method: 'OPTIONS',
            mode: 'cors'
          })
          .then(function(response) {
            console.log('[AI CRO] Connection test result:', response.status, response.statusText);
            return response.ok;
          })
          .catch(function(error) {
            console.error('[AI CRO] Connection test failed:', error);
            return false;
          });
        },
        
        // Add a helper to show the bookmarklet UI
        getBookmarklet: function() {
          window.open('${finalHost}/api/aicro-script?bookmarklet=true', '_blank');
          return this;
        },
        
        // Get a URL that will activate the selector when visited
        getSelectorURL: function() {
          const url = new URL(window.location.href);
          url.searchParams.set('aicro_selector', 'true');
          return url.toString();
        },
        
        // Initialize the AI CRO system
        init: function(options = {}) {
          if (config.initialized) {
            if (config.debug) {
              console.log('[AI CRO] Already initialized');
            }
            return this;
          }
          
          // Merge options with defaults
          if (options) {
            Object.keys(options).forEach(key => {
              config[key] = options[key];
            });
          }
          
          if (config.debug) {
            console.log('[AI CRO] Initializing with config:', config);
          }
          
          // Set initialized to true before proceeding with rest of initialization
          config.initialized = true;
          return this;
        },
        
        // Enable debug mode
        debug: function(enable = true) {
          config.debug = enable;
          return this;
        }
      });
      
      // Make module exports available for CommonJS/AMD/UMD compatibility
      if (typeof module !== 'undefined' && module.exports) {
        module.exports = AICRO;
      } else if (typeof define === 'function' && define.amd) {
        define([], function() { return AICRO; });
      }
      
      // Log this so users can see the script loaded properly
      console.log('[AI CRO] Script loaded. Use AICRO.debug(true).init() to initialize.');
    })();
  `;

  return new Response(clientScript, { headers });
} 